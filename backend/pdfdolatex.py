import requests
import json
import os
import time
from dotenv import load_dotenv

config = load_dotenv(override=True)

with open(os.path.expanduser('~/.mathpix')) as f:
    APP_ID = f.readline().strip()
    APP_KEY = f.readline().strip()

def send_file_to_mathpix(file_path, output_format, purpose='pdf'):
    url = f'https://api.mathpix.com/v3/{purpose}'
    headers = {
        'app_id': APP_ID,
        'app_key': APP_KEY,
        'Content-Type': 'application/json'
    }

    with open(file_path, 'r', encoding='utf-8') as file:
        if purpose == 'pdf':
            options = {
                'options_json': json.dumps({
                    "conversion_formats": {output_format: True},
                    "rm_spaces": True})
            }
        if purpose == "converter":
            options = json.dumps({
                "mmd": file.read(),
                "formats": {
                    "md": True,
                    "tex.zip": True
                }
                })
        print(f"Sending {os.path.getsize(file_path) / 1000} kb to Mathpix")
        if purpose == "pdf":
            response = requests.post(url, headers=headers, data=options, files={"file": open(file_path,"rb")
    } )
        if purpose == "converter":
            response = requests.post(url, headers=headers, data=options)
        response_data = response.json()

        if 'pdf_id' in response_data or 'conversion_id' in response_data:
            try:
                pdf_id = response_data['pdf_id']
                print(f"PDF ID: {pdf_id}")
                return pdf_id
            except:
                conversion_id = response_data['conversion_id']
                print(f"Conversion ID: {conversion_id}")
                return conversion_id
        else:
            print("Error: Unable to send file to Mathpix", response_data['error'])
            return None

def send_pdf_to_mathpix(file_path, output_format='md'):
    url = 'https://api.mathpix.com/v3/pdf'
    headers = {
        'app_id': APP_ID,
        'app_key': APP_KEY,
    }

    with open(file_path, 'rb') as file:
        files = {'file': file}
        options = {
            'options_json': json.dumps({"conversion_formats": {output_format: True}, "rm_spaces": True})
            }
        print(f"Sending {os.path.getsize(file_path) / 1000} kb to Mathpix")
        response = requests.post(url, headers=headers, data=options, files=files)
        response_data = response.json()

        if 'pdf_id' in response_data:
            pdf_id = response_data['pdf_id']
            print(f"PDF ID: {pdf_id}")
            return pdf_id
        else:
            print("Error: Unable to send PDF to Mathpix")
            return None


def wait_for_processing(file_id, purpose='pdf'):
    url = f'https://api.mathpix.com/v3/{purpose}/{file_id}'
    headers = {
        'app_id': APP_ID,
        'app_key': APP_KEY
    }

    while True:
        response = requests.get(url, headers=headers)
        response_data = response.json()
        status = response_data.get('status', None)

        if status == 'completed':
            print("Processing complete")
            return True
        elif status == 'error':
            print("Error: Unable to process PDF")
            return False
        else:
            print(f"Status: {status}, waiting for processing to complete")
            time.sleep(5)


def download_processed_file(file_id, file_format, output_path, puporse='pdf'):
    url = f'https://api.mathpix.com/v3/{puporse}/{file_id}.{file_format}'
    headers = {
        'app_id': APP_ID,
        'app_key': APP_KEY
    }

    response = requests.get(url, headers=headers)
    with open(output_path, 'wb') as output_file:
        output_file.write(response.content)
    print(f"File downloaded to {output_path}")
    
def clear_terminal():
    os.system('cls' if os.name == 'nt' else 'clear')
    
def pdf_to_md(input_pdf_path, file_type='md'):
    output_mmd_path = input_pdf_path.replace('.pdf', f'.{file_type}')
    output_convert_path = input_pdf_path.replace('.pdf', '.convert.md')
    if not os.path.exists(output_mmd_path):
        pdf_id = send_pdf_to_mathpix(input_pdf_path, file_type)
        if pdf_id and wait_for_processing(pdf_id):
            download_processed_file(pdf_id, 'md', output_mmd_path)
    # if not os.path.exists(output_convert_path):
    #     conversion_id = send_file_to_mathpix(output_mmd_path, 'converter', 'html')
    #     if conversion_id and wait_for_processing(conversion_id, 'converter'):
    #         download_processed_file(conversion_id, 'md', output_convert_path, 'converter')
pdf_to_md("example.pdf")