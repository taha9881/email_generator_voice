from flask import Flask, request, jsonify, redirect
from msal import ConfidentialClientApplication
import json
import os

app = Flask(__name__)

# ==== CONFIGURATION ====
with open("cred.json") as f:
    config = json.load(f)

CLIENT_ID = config["client_id"]
CLIENT_SECRET = config["client_secret"]
TENANT_ID = config["tenant_id"]
REDIRECT_URI = config["redirect_uri"]

AUTHORITY = f"https://login.microsoftonline.com/consumers"
SCOPE = ["Mail.Send"]
TOKEN_FILE = "tokens.json"

# ==== MSAL SETUP ====
def build_msal_app():
    return ConfidentialClientApplication(
        client_id=CLIENT_ID,
        client_credential=CLIENT_SECRET,
        authority=AUTHORITY
    )

# ==== TOKEN UTILS ====
def save_tokens(tokens):
    with open(TOKEN_FILE, "w") as f:
        json.dump(tokens, f)

def load_tokens():
    if os.path.exists(TOKEN_FILE):
        with open(TOKEN_FILE, "r") as f:
            return json.load(f)
    return None

def get_access_token():
    app = build_msal_app()
    tokens = load_tokens()

    if tokens and "refresh_token" in tokens:
        result = app.acquire_token_by_refresh_token(
            refresh_token=tokens["refresh_token"],
            scopes=SCOPE
        )
        if "access_token" in result:
            save_tokens(result)
            return result["access_token"]

    # FALLBACK: Get token via device code (user interactive)
    flow = app.initiate_device_flow(scopes=SCOPE)
    if "user_code" not in flow:
        raise ValueError("Failed to create device flow")
    print(flow["message"])  # Shows URL and code for user to enter
    result = app.acquire_token_by_device_flow(flow)

    if "access_token" in result:
        save_tokens(result)
        return result["access_token"]

    raise ValueError("Failed to acquire token")


