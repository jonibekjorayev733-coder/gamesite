import requests
import json
import sys
import traceback

try:
    print("Testing login endpoint...")
    response = requests.post(
        "http://localhost:8000/login",
        json={"username": "admin", "password": "admin123"},
        headers={"Content-Type": "application/json"},
        timeout=10
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    print(f"Response Text: {response.text}")
    
    if response.status_code == 200:
        print(f"Response JSON: {response.json()}")
    
except Exception as e:
    print(f"Error: {e}")
    traceback.print_exc()
