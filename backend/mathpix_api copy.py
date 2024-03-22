import requests
import json

options = {
    "conversion_formats": {"docx": True, "tex.zip": True},
    "rm_spaces": True
}
r = requests.post("https://api.mathpix.com/v3/pdf",
    headers={
        "app_id": "",
        "app_key": ""
    },
    data={
        "options_json": json.dumps(options)
    },
    files={
        "file": open("example.pdf","rb")
    }
)
print(r.text.encode("utf8"))