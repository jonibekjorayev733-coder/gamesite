import requests
import json

print("=" * 60)
print("TESTING USER LOGIN ENDPOINTS")
print("=" * 60)

# Test 1: Health check
print("\n1. Health Check:")
try:
    response = requests.get("http://localhost:8000/health", timeout=5)
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}")
except Exception as e:
    print(f"   Error: {e}")

# Test 2: Login with valid credentials
print("\n2. Login with valid credentials (admin/admin123):")
try:
    response = requests.post(
        "http://localhost:8000/login",
        json={"username": "admin", "password": "admin123"},
        headers={"Content-Type": "application/json"},
        timeout=5
    )
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   ✓ Success!")
        print(f"   Token: {data['access_token'][:50]}...")
        print(f"   Token Type: {data.get('token_type', 'bearer')}")
    else:
        print(f"   ✗ Error: {response.text}")
except Exception as e:
    print(f"   Error: {e}")

# Test 3: Login with invalid password
print("\n3. Login with invalid credentials (admin/wrongpass):")
try:
    response = requests.post(
        "http://localhost:8000/login",
        json={"username": "admin", "password": "wrongpass"},
        headers={"Content-Type": "application/json"},
        timeout=5
    )
    print(f"   Status: {response.status_code}")
    if response.status_code == 401:
        print(f"   ✓ Correctly rejected with 401")
        print(f"   Message: {response.json().get('detail', '')}")
    else:
        print(f"   Response: {response.text}")
except Exception as e:
    print(f"   Error: {e}")

# Test 4: Register new user
print("\n4. Register new user (newuser/password123):")
try:
    response = requests.post(
        "http://localhost:8000/register",
        json={"username": "newuser", "password": "password123"},
        headers={"Content-Type": "application/json"},
        timeout=5
    )
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"   ✓ User registered!")
        print(f"   Token: {data['access_token'][:50]}...")
    else:
        print(f"   Response: {response.text}")
except Exception as e:
    print(f"   Error: {e}")

# Test 5: Try to register duplicate user
print("\n5. Register duplicate user (should fail):")
try:
    response = requests.post(
        "http://localhost:8000/register",
        json={"username": "admin", "password": "password123"},
        headers={"Content-Type": "application/json"},
        timeout=5
    )
    print(f"   Status: {response.status_code}")
    if response.status_code == 400:
        print(f"   ✓ Correctly rejected duplicate")
        print(f"   Message: {response.json().get('detail', '')}")
    else:
        print(f"   Response: {response.text}")
except Exception as e:
    print(f"   Error: {e}")

print("\n" + "=" * 60)
print("ALL TESTS COMPLETED")
print("=" * 60)
