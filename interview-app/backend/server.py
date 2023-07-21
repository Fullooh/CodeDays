from flask import Flask, request, jsonify, make_response
from werkzeug.utils import secure_filename
from PyPDF2 import PdfReader
import io
import openai

openai.api_key = ""


app = Flask(__name__)

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST')
    return response

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return 'No file part', 400

    file = request.files['file']
    if file.filename == '':
        return 'No selected file', 400

    if file and secure_filename(file.filename):
        file_stream = io.BytesIO(file.read())
        reader = PdfReader(file_stream)
        resume = ''
        for page_num in range(len(reader.pages)):
            resume += reader.pages[page_num].extract_text()

        systempromt = 'You are an interviewer at the HR department at a company.'
        userpromt= 'Here is the resume of the interviewee that you are supposed to interview./n' +resume+ "Please come up with 10 interview questions that are as relevant as possible based on the resume you received."
        message=[
        {
            "role": "system",
            "content": systempromt
        },
        {
            "role": "user",
            "content": userpromt
        }
                ]

        response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=message,
        temperature=0.5,
        max_tokens=1000,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0
                            )
        
        response_content = response.choices[0].message.content

        return jsonify({'content': response_content}), 200

    return 'Unexpected error', 500

if __name__ == '__main__':
    app.run(debug=True)
