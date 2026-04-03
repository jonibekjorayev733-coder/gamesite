#!/usr/bin/env python3
"""Direct test of endpoint functions"""

import sys
sys.path.insert(0, "c:\\react Jonibek\\new04\\gamesite\\backend")

from main import get_all_games_with_tests, get_top_users

print("Testing get_all_games_with_tests()...")
try:
    result = get_all_games_with_tests()
    print(f"✓ Result: {result}")
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()

print("\n\nTesting get_top_users()...")
try:
    result = get_top_users()
    print(f"✓ Result: {result}")
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
