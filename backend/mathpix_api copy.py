import requests
import json

options = {
    "conversion_formats": {"docx": True, "tex.zip": True},
    "rm_spaces": True
}
r = requests.post("https://api.mathpix.com/v3/pdf",
    headers={
        "app_id": "adlyceum_5b5250_9a6003",
        "app_key": "c625fa735ca427b7800a9d8674eb591bec2fb9871f19193a1460ab2dfc1580db"
    },
    data={
        "options_json": json.dumps(options)
    },
    files={
        "file": open("example.pdf","rb")
    }
)
print(r.text.encode("utf8"))