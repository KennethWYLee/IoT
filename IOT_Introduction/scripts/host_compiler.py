"""Locate installed MSVC tools without assuming one computer's VS version."""
from pathlib import Path
import os
import subprocess


def find_vcvars() -> Path:
    installer = Path(os.environ.get("ProgramFiles(x86)", r"C:\Program Files (x86)")) / "Microsoft Visual Studio/Installer/vswhere.exe"
    if installer.exists():
        result = subprocess.run(
            [str(installer), "-latest", "-products", "*", "-requires",
             "Microsoft.VisualStudio.Component.VC.Tools.x86.x64", "-property", "installationPath"],
            capture_output=True, text=True, check=True)
        if result.stdout.strip():
            candidate = Path(result.stdout.strip()) / "VC/Auxiliary/Build/vcvars64.bat"
            if candidate.exists():
                return candidate
    raise SystemExit("NOT RUN: MSVC C++ tools unavailable; no host pass claimed.")
