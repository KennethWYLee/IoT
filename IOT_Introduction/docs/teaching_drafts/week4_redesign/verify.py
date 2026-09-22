"""Verify the maintained Week 4 Main or local Ans."""
from pathlib import Path
import subprocess
import sys
script = Path(__file__).resolve().parents[3] / "scripts/verify_redesign.py"
subprocess.run([sys.executable, str(script), "4", *sys.argv[1:]], check=True)
