import requests
import json

print("Testing fixed endpoints...")
print("=" * 60)

# Test 1: /api/tests endpoint (was 404)
print("\n1. GET /api/tests (should return list of tests):")
try:
    response = requests.get("http://localhost:8000/api/tests", timeout=5)
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   ✓ Success! Found {len(data) if isinstance(data, list) else '?'} tests")
    else:
        print(f"   Response: {response.text[:200]}")
except Exception as e:
    print(f"   Error: {e}")

print("\n2. GET /api/auth/teacher/me (with Authorization header):")
try:
    headers = {
        "Authorization": "Bearer test-token-here"
    }
    response = requests.get("http://localhost:8000/api/auth/teacher/me", headers=headers, timeout=5)
    print(f"   Status: {response.status_code}")
    if response.status_code == 422:
        print(f"   Still getting 422 - token validation issue")
    elif response.status_code == 401:
        print(f"   ✓ Now getting 401 (invalid token) instead of 422 - endpoint is fixed!")
    else:
        print(f"   Response: {response.text[:200]}")
except Exception as e:
    print(f"   Error: {e}")

print("\n" + "=" * 60)
