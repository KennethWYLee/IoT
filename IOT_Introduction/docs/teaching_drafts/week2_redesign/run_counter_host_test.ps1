param([ValidateSet('counter_host_test', 'exercise_host_test')][string]$TestName = 'counter_host_test')
$ErrorActionPreference = 'Stop'
New-Item -ItemType Directory -Path "$PSScriptRoot\tmp" -Force | Out-Null
$vs = 'C:\Program Files\Microsoft Visual Studio\2022\Community'
$vc = Get-ChildItem -LiteralPath "$vs\VC\Tools\MSVC" -Directory | Sort-Object Name -Descending | Select-Object -First 1
$sdk = 'C:\Program Files (x86)\Windows Kits\10'
$version = Get-ChildItem -LiteralPath "$sdk\Include" -Directory | Where-Object { Test-Path -LiteralPath "$($_.FullName)\ucrt" } | Sort-Object Name -Descending | Select-Object -First 1
$env:INCLUDE = "$($vc.FullName)\include;$($version.FullName)\ucrt;$($version.FullName)\shared;$($version.FullName)\um"
$env:LIB = "$($vc.FullName)\lib\x64;$sdk\Lib\$($version.Name)\ucrt\x64;$sdk\Lib\$($version.Name)\um\x64"
& "$($vc.FullName)\bin\Hostx64\x64\cl.exe" /nologo /EHsc /std:c++17 /W4 "$PSScriptRoot\$TestName.cpp" "/Fo$PSScriptRoot\tmp\$TestName.obj" "/Fe$PSScriptRoot\tmp\$TestName.exe"
if ($LASTEXITCODE -ne 0) { throw 'Host compile failed' }
$ResultName = $TestName -replace '_test$', '_results'
& "$PSScriptRoot\tmp\$TestName.exe" | Tee-Object -FilePath "$PSScriptRoot\tmp\$ResultName.txt"
if ($LASTEXITCODE -ne 0) { throw 'Host test failed' }
