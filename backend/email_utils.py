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
                "content": f"""{body}
                Thanks & Regards,
                Taha Boringwala
                Data Science | BugendaiTech
                Ph: 9518798331
            """
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
    print("Response Headers:")
    print(headers)
    print("Response Body:")
    print(response.status_code)
    print(response.text)

    if response.status_code == 202:
        print("Email sent successfully!")
    else:
        print(f"Failed to send email: {response.text}")
