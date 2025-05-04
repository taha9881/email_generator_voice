import requests

def send_email(access_token, to_email,cc_email, subject, body):
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    email_msg = {
        "message": {
            "subject": subject,
            "body": {
                "contentType": "Text",
                "content": f"""{body}"""
            },
            "toRecipients": [
                {
                    "emailAddress": {
                        "address": to_email
                    }
                }
            ],
            "ccRecipients": [
                {
                    "emailAddress": {
                        "address": cc_email
                    }
                }
            ]
        },
        "saveToSentItems": "true"
    }

    response = requests.post(
        "https://graph.microsoft.com/v1.0/me/sendMail",
        headers=headers, 
        json=email_msg
    )

    if response.status_code == 202:
        print("Email sent successfully!")
    else:
        print(f"Failed to send email: {response.text}")
