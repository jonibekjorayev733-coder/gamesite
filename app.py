#!/usr/bin/env python3
"""
Minimal Python entry point that spawns the Node.js server.
This allows Render to detect Python while actually running Node.js.
"""
import subprocess
import sys
import os

if __name__ == '__main__':
    # Run the Node.js server
    node_process = subprocess.Popen(
        ['/usr/bin/node', 'server.mjs'],
        cwd=os.path.dirname(os.path.abspath(__file__))
    )
    sys.exit(node_process.wait())
