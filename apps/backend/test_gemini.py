import os
import json
import urllib.request
import urllib.error
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

print("--- Gemini API Diagnostic Test ---")
if not api_key:
    print("[ERROR] GEMINI_API_KEY not found in env.")
    exit(1)

hidden_key = api_key[:5] + "..." + api_key[-4:] if len(api_key) > 9 else "Too short"
print(f"Key Found: {hidden_key} (Length: {len(api_key)})")

url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
payload = {
    "contents": [{"parts": [{"text": "Translate 'Hello, fitness squad!' to Thai in a cute tone."}]}]
}

print("Connecting to Gemini API...")
req_data = json.dumps(payload).encode("utf-8")
req = urllib.request.Request(
    url,
    data=req_data,
    headers={"Content-Type": "application/json"},
    method="POST"
)

try:
    with urllib.request.urlopen(req) as response:
        res_data = response.read().decode("utf-8")
        res_json = json.loads(res_data)
        candidates = res_json.get("candidates", [])
        if candidates:
            reply = candidates[0]["content"]["parts"][0]["text"]
            print("Gemini API Connection: SUCCESS!")
            print(f"AI Response: {reply.strip()}")
        else:
            print("[FAIL] Empty response.")
except urllib.error.HTTPError as he:
    print("[HTTP ERROR]")
    print(he.read().decode("utf-8"))
except Exception as e:
    print(f"[CONNECTION ERROR]: {str(e)}")
print("----------------------------------")
