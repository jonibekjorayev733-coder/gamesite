import requests

# Test login
url = "http://localhost:8000/api/auth/teacher/login"

# Database'da bor teachers:
# teacher@example.com (password: password123)
# admin@teacher.com (password: admin123)

test_cases = [
    {"email": "teacher@example.com", "password": "password123"},
    {"email": "admin@teacher.com", "password": "admin123"},
]

print("Testing teacher login endpoint...\n")

for test in test_cases:
    print(f"Testing: {test['email']}")
    try:
        response = requests.post(
            url,
            json=test,
            timeout=5
        )
        print(f"  Status: {response.status_code}")
        if response.ok:
            data = response.json()
            print(f"  ✓ Login successful!")
            print(f"  Token: {data['access_token'][:20]}...")
            print(f"  Teacher: {data['teacher']['email']}")
        else:
            print(f"  ✗ Error: {response.text}")
    except Exception as e:
        print(f"  ✗ Error: {e}")
    print()
