#!/usr/bin/env python
"""Test imports to identify issues"""
import sys
sys.path.insert(0, '.')

print("Step 1: Importing database...")
try:
    from database import engine, Base, SessionLocal
    print("✓ Database imported")
except Exception as e:
    print(f"✗ Database import failed: {e}")
    sys.exit(1)

print("Step 2: Importing models...")
try:
    import models
    print("✓ Models imported")
except Exception as e:
    print(f"✗ Models import failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("Step 3: Importing auth...")
try:
    from routers import auth
    print("✓ Auth router imported")
except Exception as e:
    print(f"✗ Auth router import failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("Step 4: Importing teacher_auth...")
try:
    from routers import teacher_auth
    print("✓ Teacher auth router imported")
except Exception as e:
    print(f"✗ Teacher auth router import failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n✓ All imports successful!")
