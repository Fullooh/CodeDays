import React, { useState } from "react";
import './drag-drop-file.css';

// drag drop file component
function DragDropFile() {


  const [file, setFile] = useState(null);
  const [responseData, setResponseData] = useState(null); // Holds server response
  const [errorMessage, setErrorMessage] = useState(null); // Holds server error
  const [isLoading, setIsLoading] = useState(false); // Tracks loading status
  // drag state
  const [dragActive, setDragActive] = React.useState(false);
  const [jobPosition, setJobPosition] = useState(''); // Holds the job position
  const [jobDescription, setJobDescription] = useState(''); // Holds the job description


  const handleJobPositionChange = (e) => {
    setJobPosition(e.target.value);
  }

  const handleJobDescriptionChange = (e) => {
    setJobDescription(e.target.value);
  }
  
  // handle drag events
  const handleDrag = function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
    
  // triggers when file is dropped
  const handleDrop = function(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setFile(e.dataTransfer.files[0]);
    setErrorMessage(null);
  };

  const handleSubmit = async () => {
    setIsLoading(true); // Set loading to true when request starts
    const formData = new FormData();
    formData.append('file', file);
    formData.append('jobPosition', jobPosition);
    formData.append('jobDescription', jobDescription);

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            setErrorMessage(data.error); // Update the error message state
            throw new Error(`HTTP error! status: ${response.status}`);
        } else {
            setResponseData(data.content); // Set the response data in state
        }
    } catch (error) {
        console.log(error);
    } finally {
        setIsLoading(false); // Set loading to false after request finishes
    }
  }

  const handleAnswerSubmit = async (question, index) => {
    const answerTextArea = document.getElementById(`answer-${index}`);
    const answer = answerTextArea.value;

    try {
      const response = await fetch('/submit-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          answer,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      } else {
        // Process the response if needed
        const data = await response.json();
        console.log(data);
      }
    } catch (error) {
      console.log(error);
    }
  };


  return (
    <div className="flex flex-col mb-10 mx-auto">
    
    <div className="flex justify-center items-center" style={{backgroundColor: "#3C82F6", height: '75px', fontSize: '20px', fontWeight:'700', color: "#FFFFFF" }}>Interview Simulator</div>

    <form id="form-file-upload" style={{ width: '46%', margin: '30px', fontSize: '18px' }} onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()}>    
      <label id="label-file-upload" htmlFor="input-file-upload" className={dragActive ? "drag-active" : "" }>        
        <div>
          <h1>Drag & Drop Your Resume Here!</h1>
          {/* Display the selected file name */}
          
          {file && (
            <div style={{ margin: '30px', color: 'green', fontSize: '15px' }}>
              <p>Selected File: {file.name}</p>
            </div>
          )}

          {errorMessage ? (
          <div style={{ color: 'red', fontSize: '15px' }}>
            <p className="error-text">Error:</p>
            <p>{errorMessage}</p>
          </div>
          ) : null}

        </div>       
      </label>   
      { dragActive && <div id="drag-file-element" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}></div> }
    </form>

    <textarea style={{ position: 'absolute', transform: 'translate(108%, 155%)', width: '46%', maxWidth: '50%', height: '3rem', minHeight: '3rem', maxHeight: '3rem', margin: '30px' }} // Use textarea for multiline text input
      placeholder="Optional Job Position..."
      className="p-2 bg-transparent border-2 rounded-2xl focus:outline-none px-5 py-2.5"
      onChange={handleJobPositionChange}
    />

    <textarea style={{ position: 'absolute', transform: 'translate(108%, 73%)', width: '46%', maxWidth: '50%', height: '12rem', minHeight: '12rem', maxHeight: '12rem', margin: '30px' }} // Use textarea for multiline text input
      placeholder="Optional Job Description..."
      className="p-2 bg-transparent border-2 rounded-2xl focus:outline-none px-5 py-4"
      onChange={handleJobDescriptionChange}
    />

    <button onClick={handleSubmit} style={{ fontWeight: '500' }}
      className="inline-block px-4 py-2 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300 mx-auto"
    >Generate AI-Powered Questions!</button>

    {/* Conditionally rendering loading text or server response */}
    {isLoading ? (
      <div className="mt-5" style={{ margin: '30px' }}>
        <p>Loading...</p>
       </div>
      ) : responseData ? (
        <div className="mt-5" style={{ margin: '30px' }}>
          <h3 className="text-xl" style={{ marginBottom: '30px' }}>Interview Questions:</h3>
          {responseData.split('\n').map((response, index) => (
          <div key={index} className="border p-4 rounded-2xl shadow-md mb-4">
            <p className="text-lg font-bold">Question {index + 1}</p>
            <p>{response}</p>
              <textarea
            className="p-2 bg-gray-100 mt-2 rounded-2xl resize-none w-full px-5 py-4"
            placeholder="Answer the question here..."
            rows="3">
              </textarea>
                <button
                  className="px-4 py-2 mt-2 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
                  onClick={() => handleAnswerSubmit(response, index)}
                >
                 Submit
                </button>
          </div>
          ))}
        </div>
      ) : null}
      </div>
  );
}

export default DragDropFile;