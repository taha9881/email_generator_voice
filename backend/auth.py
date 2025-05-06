from flask import Flask, request, jsonify, redirect
from msal import ConfidentialClientApplication
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

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

# ==== DATABASE CONFIGURATION ====
DB_CONFIG = {
    "dbname": "email_generator",
    "user": "postgres",
    "password": "postgres",
    "host": "localhost",
    "port": "5432"
}

def get_db_connection():
    return psycopg2.connect(**DB_CONFIG)

def init_db():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS tokens (
            id SERIAL PRIMARY KEY,
            access_token TEXT,
            refresh_token TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    cur.close()
    conn.close()

# Initialize database on startup
init_db()

# ==== MSAL SETUP ====
def build_msal_app():
    return ConfidentialClientApplication(
        client_id=CLIENT_ID,
        client_credential=CLIENT_SECRET,
        authority=AUTHORITY
    )

# ==== TOKEN UTILS ====
def save_tokens(tokens):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO tokens (access_token, refresh_token)
        VALUES (%s, %s)
    """, (tokens.get("access_token"), tokens.get("refresh_token")))
    conn.commit()
    cur.close()
    conn.close()

def load_tokens():
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("""
        SELECT access_token, refresh_token
        FROM tokens
        ORDER BY created_at DESC
        LIMIT 1
    """)
    result = cur.fetchone()
    cur.close()
    conn.close()
    return result

def get_access_token():
    app = build_msal_app()
    tokens = load_tokens()

    if tokens and tokens.get("refresh_token"):
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
    result = app.acquire_token_by_device_flow(flow)

    if "access_token" in result:
        save_tokens(result)
        return result["access_token"]

    raise ValueError("Failed to acquire token")


