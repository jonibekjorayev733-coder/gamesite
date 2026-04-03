#!/usr/bin/env python3
"""Debug main.py import"""

import sys
sys.path.insert(0, "c:\\react Jonibek\\new04\\gamesite\\backend")

try:
    print("Importing main...")
    import main
    print("✓ main.py imported successfully")
    
    print("\nChecking app...")
    print(f"✓ app type: {type(main.app)}")
    
    print("\nRoutes:")
    for route in main.app.routes:
        print(f"  - {route.path}")
        
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
