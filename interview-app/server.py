from flask import Flask, request, jsonify, make_response, send_from_directory
from werkzeug.utils import secure_filename
from PyPDF2 import PdfReader 
import io, os
import openai
from dotenv import load_dotenv


load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")




app = Flask(__name__,static_folder='build')

def get_questions(resume,position,description):
    systempromt = 'You are an interviewer at the HR department at a company.'
    if description!='':
        userpromt= 'Given the resume of the interviewee: '+resume+ ' and the job description for the role '+description+" please generate 5 interview questions that are specifically tailored to the candidate's resume and 5 interview questions based on the requirements of the job role. Only return questions without any additional information or empty lines."
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
        temperature=0.6,
        max_tokens=1100,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0
            )
        
        response_content = response.choices[0].message.content

    elif description=='':
        if position=='':
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

        else:
            userpromt= 'Here is the resume of the interviewee that you are supposed to interview./n' +resume+ " The job position the candidate is being interviewed for is "+position+ " Create 6 relevant interview questions based on the resume you received and 4 behavioral questions about the job position.  Only return questions without any additional information or empty lines."

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
            temperature=0.6,
            max_tokens=1100,
            top_p=1,
            frequency_penalty=0,
            presence_penalty=0
            )

            response_content = response.choices[0].message.content


    response_list = response_content.split("\n")
    newlist = []

    for i in response_list:
        if i!='':
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
    position = request.form.get('jobPosition')
    description=request.form.get('jobDescription')

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

        response_content = get_questions(resume, position, description)

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