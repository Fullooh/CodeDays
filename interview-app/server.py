from flask import Flask, request, jsonify, make_response, send_from_directory
from werkzeug.utils import secure_filename
from PyPDF2 import PdfReader 
import io, os
import openai
from dotenv import load_dotenv


load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")




app = Flask(__name__,static_folder='build')

def get_questions(resume,text):
    if text!='':
        systempromt = 'You are an interviewer at the HR department at a company.'
        userpromt= 'Below is the job description of the job that you are interviewing for:/n'+text+'Here is the resume of the interviewee:/n' +resume+ "Come up with 10 relevant interview questions based on the resume you received and the job description. There must be both questions related to the resume. Only return questions and index numbers without any additional information or empty lines."
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
        temperature=0.8,
        max_tokens=1100,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0
            )
        
        response_content = response.choices[0].message.content

    elif text=='':
        systempromt = 'You are an interviewer at the HR department at a company.'
        userpromt= 'Here is the resume of the interviewee that you are supposed to interview./n' +resume+ "Please return 10 interview questions that are as relevant as possible based on the resume you received without any additional words."

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
        temperature=0.8,
        max_tokens=1100,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0
        )

        response_content = response.choices[0].message.content


    response_list = response_content.split("\n")
    newlist = []

    for i in response_list:
        if i[0].isnumeric():
            i=i[i.find(".")+2:]
        i=i+"\n"
        newlist.append(i)

    newresponse=''
    for i in newlist:
        newresponse=newresponse+i
    newresponse=newresponse.strip()

    return newresponse



@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST')
    return response

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    text = request.form.get('text')

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if not file.filename.lower().endswith('.pdf'):
        return jsonify({'error': 'Please upload a PDF file.'}), 400


    if file and secure_filename(file.filename):
        try:
            file_stream = io.BytesIO(file.read())
            reader = PdfReader(file_stream)
            resume = ''
            for page_num in range(len(reader.pages)):
                resume += reader.pages[page_num].extract_text()
        except PdfReadError:
            return jsonify({'error': 'Unable to read PDF file. Please ensure it is a valid PDF document.'}), 400

        response_content = get_questions(resume, text)

        return jsonify({'content': response_content}), 200

    return jsonify({'error': 'Unexpected error'}), 500


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists("build/" + path):
        return send_from_directory('build', path)
    else:
        return send_from_directory('build', 'index.html')

if __name__ == '__main__':
    app.run(debug=True)