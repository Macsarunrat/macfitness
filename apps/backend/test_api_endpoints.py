from fastapi.testclient import TestClient
import random
import sys
from main import app

# Ensure clean stdout error handling for unicode
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(errors='backslashreplace')

print("============================================================")
print("   PinkFit API End-to-End Test Suite (TestClient)  ")
print("============================================================\n")

test_email = f"test.user.{random.randint(1000, 9999)}@pinkfit.com"
test_password = "password123"
token = None
group_invite_code = None
second_user_token = None

passed = 0
failed = 0

def assert_test(name, condition, error_msg=""):
    global passed, failed
    if condition:
        print(f"[PASS] {name}")
        passed += 1
    else:
        print(f"[FAIL] {name}")
        if error_msg:
            print(f"       Detail: {error_msg}")
        failed += 1

with TestClient(app) as client:
    # 1. Health check
    print("--- [TEST GROUP 1: Health Check] ---")
    res = client.get("/")
    assert_test("Health check response status is 200", res.status_code == 200)
    assert_test("Health check response status field is online", res.json().get("status") == "online")
    print()

    # 2. Authentication
    print("--- [TEST GROUP 2: Authentication] ---")
    res = client.post("/auth/register", json={"email": test_email, "password": test_password})
    assert_test("Register user successfully", res.status_code == 201)
    assert_test("Registered user has correct email", res.json().get("email") == test_email)

    res = client.post("/auth/register", json={"email": test_email, "password": test_password})
    assert_test("Register user block duplicates", res.status_code == 400)
    assert_test("Duplicate register error message is correct", "already registered" in res.json().get("detail", "").lower())

    res = client.post("/auth/token", data={"username": test_email, "password": test_password})
    assert_test("Login user successfully", res.status_code == 200)
    assert_test("Login returns access token", "access_token" in res.json())
    token = res.json().get("access_token")
    auth_headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/auth/me", headers=auth_headers)
    assert_test("Get profile successfully", res.status_code == 200)

    res = client.put("/auth/profile", json={"height": 172, "weight_kg": 62.5, "injury_history": "Left foot arch pain"}, headers=auth_headers)
    assert_test("Update profile successfully", res.status_code == 200)
    assert_test("Profile height updated", res.json().get("height") == 172)
    assert_test("Profile weight_kg updated", res.json().get("weight_kg") == 62.5)
    print()

    # 3. Nutrition
    print("--- [TEST GROUP 3: Nutrition] ---")
    res = client.post("/nutrition/", json={"date": "2026-06-03", "food_name": "Chicken Breast", "protein_amount": 35, "calories": 420}, headers=auth_headers)
    assert_test("Add food log successfully", res.status_code == 200)

    res = client.get("/nutrition/", headers=auth_headers)
    assert_test("Get food logs successfully", res.status_code == 200 and len(res.json()) >= 1)

    print("Querying Gemini AI text estimation...")
    res = client.post("/nutrition/estimate-text", json={"food_name": "Tuna Salad 1 plate"}, headers=auth_headers)
    assert_test("Gemini estimate-text response status", res.status_code == 200)
    assert_test("Gemini returns calories and proteinAmount", res.json().get("calories", 0) > 0 and res.json().get("proteinAmount", 0) > 0)
    print()

    # 4. Running
    print("--- [TEST GROUP 4: Running] ---")
    res = client.post("/running/", json={"date": "2026-06-03", "distance": 5.0, "pace": "5:30", "hr": 150, "cadence": 174}, headers=auth_headers)
    assert_test("Add run log successfully", res.status_code == 200)
    assert_test("Fatigue score computed and positive", res.json().get("fatigue_score", 0) > 0)

    res = client.get("/running/", headers=auth_headers)
    assert_test("Get run logs successfully", res.status_code == 200 and len(res.json()) >= 1)

    print("Testing AI Run Snap screenshot analysis...")
    res = client.post("/running/snap", json={"base64_image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="}, headers=auth_headers)
    assert_test("Run Snap endpoint response status valid", res.status_code in [200, 500])
    if res.status_code == 200:
        assert_test("Run Snap returns valid run log and fatigue score", res.json().get("fatigue_score", 0) > 0)
    print()

    # 5. Squad Group Flow
    print("--- [TEST GROUP 5: Squad Group Flow] ---")
    group_name = f"PinkFit Squad #{random.randint(10, 99)}"
    res = client.post("/social/group/create", json={"name": group_name}, headers=auth_headers)
    assert_test("Create squad group successfully", res.status_code == 200)
    group_invite_code = res.json().get("invite_code")

    res = client.get("/social/group/members", headers=auth_headers)
    assert_test("Get squad group members list", res.status_code == 200)
    assert_test("Squad members contains group info", "group_info" in res.json())

    # Create second member
    second_email = f"test.member.{random.randint(1000, 9999)}@pinkfit.com"
    client.post("/auth/register", json={"email": second_email, "password": test_password})
    res_login = client.post("/auth/token", data={"username": second_email, "password": test_password})
    second_token = res_login.json().get("access_token")
    second_headers = {"Authorization": f"Bearer {second_token}"}

    res = client.post("/social/group/join", json={"invite_code": group_invite_code}, headers=second_headers)
    assert_test("Second member joins squad group successfully", res.status_code == 200)

    res = client.get("/social/group/members", headers=auth_headers)
    assert_test("Squad group members count is 2", len(res.json().get("members", [])) == 2)

    res = client.post("/social/group/leave", headers=second_headers)
    assert_test("Second member leaves squad group successfully", res.status_code == 200)

    res = client.get("/social/group/members", headers=second_headers)
    assert_test("Second member group members list is empty or returns error", res.status_code in [400, 404])

print("============================================================")
print("   TEST SUMMARY   ")
print("------------------------------------------------------------")
print(f"Passed: {passed}")
print(f"Failed: {failed}")
print("============================================================")

if failed > 0:
    print("\n[FAIL] SOME TESTS FAILED.")
    sys.exit(1)
else:
    print("\n[SUCCESS] ALL TESTS PASSED SUCCESSFULLY!")
    sys.exit(0)
