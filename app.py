#!/usr/bin/env python3
"""
Minimal Python entry point that spawns the Node.js server.
This allows Render to detect Python while actually running Node.js.
"""
import subprocess
import sys
import os

if __name__ == '__main__':
    # Get the directory where this script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Build the command - try different possible node paths
    node_paths = [
        '/usr/bin/node',
        '/usr/local/bin/node',
        'node',  # Use PATH
    ]
    
    node_cmd = None
    for path in node_paths:
        try:
            result = subprocess.run([path, '--version'], capture_output=True, check=True)
            node_cmd = path
            print(f"Found Node.js at: {path}")
            print(f"Version: {result.stdout.decode().strip()}")
            break
        except (FileNotFoundError, subprocess.CalledProcessError):
            continue
    
    if not node_cmd:
        print("ERROR: Node.js not found!")
        sys.exit(1)
    
    # Run the Node.js server
    print(f"Starting Node.js server with: {node_cmd} server.mjs")
    print(f"Working directory: {script_dir}")
    
    try:
        node_process = subprocess.Popen(
            [node_cmd, 'server.mjs'],
            cwd=script_dir,
            stdout=sys.stdout,
            stderr=sys.stderr
        )
        exit_code = node_process.wait()
        print(f"Node.js server exited with code: {exit_code}")
        sys.exit(exit_code)
    except Exception as e:
        print(f"ERROR: Failed to start Node.js server: {e}")
        sys.exit(1)
