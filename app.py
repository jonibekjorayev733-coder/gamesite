#!/usr/bin/env python3
"""
Minimal Python entry point that spawns the Node.js server.
This allows Render to detect Python while actually running Node.js.
"""
import subprocess
import sys
import os
import shutil

if __name__ == '__main__':
    # Create a symlink from dist to build if needed (Render compatibility)
    current_dir = os.path.dirname(os.path.abspath(__file__))
    dist_dir = os.path.join(current_dir, 'dist')
    build_dir = os.path.join(current_dir, 'build')
    
    if os.path.exists(dist_dir) and not os.path.exists(build_dir):
        try:
            shutil.copytree(dist_dir, build_dir)
            print(f"Created build directory from dist")
        except Exception as e:
            print(f"Could not create build directory: {e}")
    
    # Run the Node.js server
    node_process = subprocess.Popen(
        ['/usr/bin/node', 'server.mjs'],
        cwd=current_dir
    )
    sys.exit(node_process.wait())
