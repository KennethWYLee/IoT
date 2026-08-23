param(
    [Parameter(Mandatory = $true)]
    [string]$MarkdownPath,

    [string]$Fqbn = 'esp32:esp32:esp32s3'
)

$ErrorActionPreference = 'Stop'

$resolvedMarkdown = (Resolve-Path -LiteralPath $MarkdownPath).Path
$cliCandidates = @(@(
    (Get-Command arduino-cli -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source),
    'C:\Program Files\Arduino IDE\resources\app\lib\backend\resources\arduino-cli.exe',
    'C:\Program Files (x86)\Arduino IDE\resources\app\lib\backend\resources\arduino-cli.exe'
) | Where-Object { $_ -and (Test-Path -LiteralPath $_) } | Select-Object -Unique)

if (-not $cliCandidates) {
    throw 'arduino-cli was not found.'
}

$arduinoCli = $cliCandidates[0]
$markdown = Get-Content -Raw -Encoding UTF8 -LiteralPath $resolvedMarkdown
$matches = [regex]::Matches($markdown, '(?ms)^```cpp\s*\r?\n(.*?)^```\s*$')

if ($matches.Count -eq 0) {
    throw "No cpp code fences were found in $resolvedMarkdown"
}

$temporaryBase = [System.IO.Path]::GetFullPath([System.IO.Path]::GetTempPath())
$runDirectory = Join-Path $temporaryBase ("ntub-iot-arduino-{0}" -f [guid]::NewGuid())
$resolvedRunDirectory = [System.IO.Path]::GetFullPath($runDirectory)

if (-not $resolvedRunDirectory.StartsWith($temporaryBase, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Unsafe temporary directory: $resolvedRunDirectory"
}

New-Item -ItemType Directory -Path $resolvedRunDirectory | Out-Null

try {
    for ($index = 0; $index -lt $matches.Count; $index++) {
        $sketchName = 'markdown_sketch_{0:D2}' -f ($index + 1)
        $sketchDirectory = Join-Path $resolvedRunDirectory $sketchName
        New-Item -ItemType Directory -Path $sketchDirectory | Out-Null

        $sketchPath = Join-Path $sketchDirectory "$sketchName.ino"
        $source = $matches[$index].Groups[1].Value.Trim() + [Environment]::NewLine
        [System.IO.File]::WriteAllText($sketchPath, $source, [System.Text.UTF8Encoding]::new($false))

        Write-Host "Compiling code block $($index + 1)/$($matches.Count): $sketchName"
        & $arduinoCli compile --fqbn $Fqbn --warnings all $sketchDirectory
        if ($LASTEXITCODE -ne 0) {
            throw "Compilation failed for code block $($index + 1)."
        }
    }
}
finally {
    if (Test-Path -LiteralPath $resolvedRunDirectory) {
        $verifiedTarget = [System.IO.Path]::GetFullPath($resolvedRunDirectory)
        if ($verifiedTarget.StartsWith($temporaryBase, [System.StringComparison]::OrdinalIgnoreCase) -and
            (Split-Path -Leaf $verifiedTarget).StartsWith('ntub-iot-arduino-')) {
            Remove-Item -LiteralPath $verifiedTarget -Recurse -Force
        }
    }
}

Write-Host "Compiled $($matches.Count) Arduino code blocks successfully."
