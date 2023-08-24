from flask import Flask, request, jsonify, make_response, send_from_directory, session
from werkzeug.utils import secure_filename
from PyPDF2 import PdfReader 
import io, os
import openai
from dotenv import load_dotenv


load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")


app = Flask(__name__,static_folder='build')
app.secret_key = os.urandom(24) 

def get_questions(resume,position,description):
    systempromt = 'You are an interviewer at the HR department at a company.'
    if description!='':
        userpromt= 'Given the resume of the interviewee: ' +resume+ ' and the job description for the role ' +description+ " please generate the 10 most effective and relevant interview questions based on the resume you received and the job description without any additional words."
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
        model="gpt-4",
        messages=message,
        temperature=1,
        max_tokens=1100,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0
            )
        
        response_content = response.choices[0].message.content

    elif description=='':
        if position=='':
            userpromt= 'Given the resume of the interviewee: ' +resume+ " please generate 10 interview questions that are as relevant as possible based on the resume you received without any additional words."

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
            model="gpt-4",
            messages=message,
            temperature=1,
            max_tokens=1100,
            top_p=1,
            frequency_penalty=0,
            presence_penalty=0
            )

            response_content = response.choices[0].message.content

        else:
            userpromt= 'Given the resume of the interviewee: ' +resume+ ' and the job position the candidate is being interviewed for is ' +position+ " Create 10 interview questions including questions based on the resume you received and technical and behavioral questions about the job position.  Only return questions and index numbers without any additional information or empty lines."

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
            model="gpt-4",
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

def get_feedback(resume,position,description,question,answer):
    response = openai.ChatCompletion.create(
    model="gpt-4",
    messages=[
    {
      "role": "system",
      "content": "You are a helpful assistant who provides constructive feedback to interviewees. "
    },
    {
      "role": "user",
      "content": "Here is the resume of the interviewee: "+resume+" The job position the candidate is being interviewed for is "+position+" The job description of the job the candidate is applying for is: "+description+" The question the candidate is answering is "+ question+ " Here is the candidate's answer: " +answer+ " Provide relevant and constructive feedback and suggestions to the candidate's answer."
    } 
    ],
    temperature=1,
    max_tokens=1045,
    top_p=1,
    frequency_penalty=0,
    presence_penalty=0
    )

    response_content = response.choices[0].message.content
    
    return response_content


@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST')
    return response


@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No File Part'}), 400

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

        session['resume'] = resume
        session['position'] = position
        session['description'] = description

        return jsonify({'content': response_content}), 200

    return jsonify({'error': 'Unexpected error'}), 500

@app.route('/submit-answer', methods=['POST'])
def submit_answer():
    # Process the incoming JSON data
    json_data = request.get_json()
    question = json_data.get('question')
    answer = json_data.get('answer')
    if answer=="":
        return jsonify({'error': 'No Answer Submitted'}), 400
    else:
        # Retrieve data from the session
        resume = session.get('resume')
        position = session.get('position')
        description = session.get('description')

        feedback = get_feedback(resume,position,description,question,answer)

        return jsonify({'feedback': feedback}),200

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists("build/" + path):
        return send_from_directory('build', path)
    else:
        return send_from_directory('build', 'index.html')

if __name__ == '__main__':
    app.run(debug=True)
