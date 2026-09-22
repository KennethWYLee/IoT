"""Verify Week 7 Main or local Ans."""
from pathlib import Path
import subprocess
import sys
subprocess.run([sys.executable, str(Path(__file__).resolve().parents[3] / "scripts/verify_redesign.py"), "7", *sys.argv[1:]], check=True)
