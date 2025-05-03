from flask import Flask, request, jsonify
from flask_cors import CORS
import os
<<<<<<< HEAD
import pywhisper
from auth import get_access_token, build_msal_app, save_tokens, SCOPE, REDIRECT_URI
import re

from llm import get_response, get_response_general
from email_utils import send_email
=======
import io
import json
import soundfile as sf
import pywhisper
from auth import get_access_token, build_msal_app, save_tokens, SCOPE, REDIRECT_URI

from llm import get_response
from email_utils import send_email
from auth import get_access_token
>>>>>>> 2a1f060 (init commit)

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

model = pywhisper.load_model("base")

from pydub import AudioSegment

@app.route('/transcribe', methods=['POST'])
def transcribe():
    audio = request.files['audio']
    audio_data = audio.read()

    # Convert to WAV using pydub
    temp_path = 'temp_input.webm'
    with open(temp_path, 'wb') as f:
        f.write(audio_data)

    sound = AudioSegment.from_file(temp_path)
    wav_path = 'temp.wav'
    sound.export(wav_path, format='wav')

    result = model.transcribe(wav_path)

    os.remove(temp_path)
    os.remove(wav_path)
    return jsonify({"text": result.get("text", "")})

@app.route('/generate', methods=['POST'])
def generate():
    content = request.json.get("text", "")
    if not content:
        return jsonify({"error": "No input text provided"}), 400
<<<<<<< HEAD
    ai_response = get_response_general(content)
    # Extract Subject and Body using regex
    subject_match = re.search(r"Subject:\s*(.+)", ai_response)
    body_match = re.search(r"Body:\s*(.+)", ai_response, re.DOTALL)

    # Prepare JSON object
    email_json = {
        "Subject": subject_match.group(1).strip() if subject_match else "",
        "Body": body_match.group(1).strip() if body_match else ""
    }
    return jsonify({"response": email_json})

@app.route('/send-mail', methods=['POST'])
def mail():
    data = request.json
    token = data.get("access_token")
    if not token:
        token = get_access_token()
        if not token:
            return jsonify({"error": "Not authenticated"}), 401
    send_email(
        access_token=token,
        to_email=data.get("to_email"),
        cc_email=data.get("cc_email"),
        subject=data.get("subject", "Daily Status Report"),
=======
    ai_response = get_response(content)
    return jsonify({"response": ai_response})

@app.route('/send-mail', methods=['POST'])
def mail():
    # ==== CONFIGURATION ====
    with open("cred.json") as f:
        config = json.load(f)
    data = request.json
    token = get_access_token()
    send_email(
        access_token=token,
        to_email=config.get("to_mail"),
        cc_email=config.get("cc_mail"),
        subject= "Daily Status Report",
>>>>>>> 2a1f060 (init commit)
        body=data["body"]
    )
    return jsonify({"status": "sent"})

# ==== FLASK ROUTES ====

@app.route("/token", methods=["GET"])
def token_route():
    access_token = get_access_token()
    if access_token:
        return jsonify({"access_token": access_token})
    else:
        return jsonify({"error": "Not authenticated"}), 401

@app.route("/auth-url", methods=["GET"])
def get_auth_url():
    app_msal = build_msal_app()
    auth_url = app_msal.get_authorization_request_url(
        scopes=SCOPE,
        redirect_uri=REDIRECT_URI
    )
    return jsonify({"auth_url": auth_url})

@app.route("/auth-callback", methods=["POST"])
def auth_callback():
    data = request.get_json()
    full_url = data.get("url")

    if not full_url or "code=" not in full_url:
        return jsonify({"error": "Missing or invalid URL"}), 400

    try:
        auth_code = full_url.split("code=")[1].split("&")[0]
        app_msal = build_msal_app()
        result = app_msal.acquire_token_by_authorization_code(
            code=auth_code,
            scopes=SCOPE,
            redirect_uri=REDIRECT_URI
        )

        if "access_token" in result:
            save_tokens(result)
            return jsonify({"access_token": result["access_token"]})
        else:
            return jsonify({"error": result.get("error_description", "Unknown error")}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    
# main driver function
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)