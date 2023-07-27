import React, { useState } from "react";
import './drag-drop-file.css';

// drag drop file component
function DragDropFile() {


  const [file, setFile] = useState(null);
  const [text, setText] = useState(''); // Holds the user's optional text input
  const [responseData, setResponseData] = useState(null); // Holds server response
  const [errorMessage, setErrorMessage] = useState(null); // Holds server error
  const [isLoading, setIsLoading] = useState(false); // Tracks loading status
  // drag state
  const [dragActive, setDragActive] = React.useState(false);
    

  const handleTextChange = (e) => {
    setText(e.target.value);
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
    formData.append('text', text);

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


  return (
    <div className="flex flex-col mb-10 mx-auto">
    
    <div className="flex justify-center items-center" style={{backgroundColor: "#3C82F6", height: '75px', fontSize: '20px', fontWeight:'700', color: "#FFFFFF" }}>Interview Simulator</div>

    <form id="form-file-upload" style={{ width: '46%', margin: '30px', fontSize: '18px' }} onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()}>    
      <label id="label-file-upload" htmlFor="input-file-upload" className={dragActive ? "drag-active" : "" }>        
        <div>
          <h1>Drag and drop your resume here!</h1>
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

    <textarea style={{ position: 'absolute', transform: 'translate(108%, 30%)', width: '46%', maxWidth: '50%', height: '16rem', minHeight: '16rem', maxHeight: '16rem', margin: '30px' }} // Use textarea for multiline text input
      placeholder="Optional Job Description..."
      className="p-2 bg-transparent border-2 rounded-2xl focus:outline-none px-6 py-5"
      onChange={handleTextChange}
    />

    <button onClick={handleSubmit} style={{ fontWeight: '500' }}
      className="inline-block px-4 py-2 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300 mx-auto"
    >Generate Questions!</button>

    {/* Conditionally rendering loading text or server response */}
    {isLoading ? (
      <div className="mt-5" style={{ margin: '30px' }}>
        <p>Loading...</p>
       </div>
      ) : responseData ? (
        <div className="mt-5" style={{ margin: '30px' }}>
          <h3 className="text-xl">Interview Questions:</h3>
          {responseData.split('\n').map((response, index) => (
          <div key={index} className="border p-4 rounded-lg shadow-md mb-4">
            <p className="text-lg font-bold">Question {index + 1}</p>
            <p>{response}</p>
          </div>
          ))}
        </div>
      ) : null}
      </div>
  );
}

export default DragDropFile;