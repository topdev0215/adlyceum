import requests
import json
import base64

# Your Mathpix API credentials
headers ={
    "app_id": "adlyceum_5b5250_9a6003",
    "app_key": "c625fa735ca427b7800a9d8674eb591bec2fb9871f19193a1460ab2dfc1580db",
    "Content-Type": "application/json",
}

# The PDF file you want to convert
file_path = 'example.pdf'
with open(file_path, 'rb') as f:
    # Convert your PDF file to a base64 string
    pdf_data = f.read()
    base64_pdf = base64.b64encode(pdf_data).decode('utf-8')

# The API endpoint for PDF to LaTeX conversion
url = "https://api.mathpix.com/v3/pdf"

# The data to send with the request
# Here, you can specify options like the range of pages to convert
data ={
    "src": "data:application/pdf;base64," + base64_pdf,
    "formats": ["text"],  # Specify "latex" for LaTeX output
    "data_options":{
        "include_latex": True,
    }
}

response = requests.post(url, headers=headers, data=json.dumps(data))

if response.status_code == 200:
    # The API response with the LaTeX string
    print("Conversion successful!")
    print(response.json())
else:
    print("Error in conversion:", response.text)