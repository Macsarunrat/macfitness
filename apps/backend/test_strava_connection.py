from fastapi.testclient import TestClient
from main import app  
import os
import sys

# Ensure clean stdout error handling for unicode
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(errors='backslashreplace')

client = TestClient(app)

STRAVA_VERIFY_TOKEN = os.getenv("STRAVA_VERIFY_TOKEN", "pinkfit_verify_token_123")

def test_1_webhook_subscription():
    """
    Test 1: Webhook Subscription Verification (hub.challenge response)
    """
    print("\n[1] Testing Strava Webhook Verification...")
    
    mock_challenge = "15f7c3b8a9e"
    response = client.get(
        f"/running/webhook/strava", 
        params={
            "hub.mode": "subscribe",
            "hub.verify_token": STRAVA_VERIFY_TOKEN,
            "hub.challenge": mock_challenge
        }
    )
    
    if response.status_code == 200 and response.json().get("hub.challenge") == mock_challenge:
        print("[PASS] Webhook verification successful. Ready to connect to Strava!")
    else:
        print(f"[FAIL] Expected 200 and challenge match. Got {response.status_code}")
        print(f"Response: {response.text}")

def test_2_webhook_event_receiving():
    """
    Test 2: Event Receiving
    """
    print("\n[2] Testing Strava Activity Event Receiving...")
    
    mock_payload = {
        "object_type": "activity",
        "object_id": 1234567890,
        "aspect_type": "create",
        "owner_id": 987654321,
        "subscription_id": 123456,
        "updates": {},
        "event_time": 1629000000
    }
    
    response = client.post("/running/webhook/strava", json=mock_payload)
    
    if response.status_code == 200:
        print("[PASS] Successfully received activity event from Strava!")
    else:
        print(f"[FAIL] Expected 200 OK. Got {response.status_code}")
        print(f"Response: {response.text}")

if __name__ == "__main__":
    print("Starting Strava Connection Check...")
    test_1_webhook_subscription()
    test_2_webhook_event_receiving()
    print("\nCheck Completed.")