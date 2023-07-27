import React, { useState } from "react";
import './drag-drop-file.css';

// drag drop file component
function DropAndButton() {


    const [file, setFile] = useState(null);
    const [userText, setUserText] = useState(''); // Holds user input text
    const [responseData, setResponseData] = useState(null); // Holds server response
    const [isLoading, setIsLoading] = useState(false); // Tracks loading status
    // drag state
    const [dragActive, setDragActive] = React.useState(false);
    // ref
    const inputRef = React.useRef(null);
    

  const handleTextChange = (e) => {
      setUserText(e.target.value);
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
  };
    
/*
  // triggers when file is selected with click
  const handleChange = function(e) {
      e.preventDefault();
      setFile(e.target.files[0]);
  };
    
  // triggers the input when the button is clicked
  const onButtonClick = () => {
      inputRef.current.click();
  };
 */   

    const handleSubmit = async () => {
      setIsLoading(true); // Set loading to true when request starts
      const formData = new FormData();
      formData.append('file', file);
      formData.append('text', userText); // Add user text to formData

      try {
          const response = await fetch('/upload', {
              method: 'POST',
              body: formData,
          });

          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          } else {
              const data = await response.json();
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
          <div className="flex justify-center items-center" style={{backgroundColor: "#EFEEEE", height: '75px'}}>Interview Simulator</div>



          <form id="form-file-upload" style={{ width: '43%', margin: '30px' }}
            onDragEnter={handleDrag} 
            onSubmit={(e) => e.preventDefault()}
          >
          <input ref={inputRef} type="file" id="input-file-upload" multiple={true} onChange={handleChange} />
          <label id="label-file-upload" htmlFor="input-file-upload" className={dragActive ? "drag-active" : "" }>
          <div>
            <p>Drag and your drop file here!</p>


          {/* Display the selected file name */}
          {file && (
            <div style={{ margin: '30px' }}>
              <p>Selected File: {file.name}</p>
            </div>
          )}



          <button className="upload-button" onClick={onButtonClick}>Upload a file</button>
          </div> 
          </label>
          { dragActive && <div id="drag-file-element" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}></div> }
          </form>


          <textarea style={{ position: 'absolute', top: '75px', left: '45%', width: '50%', height: '16rem', margin: '30px' }} // Use textarea for multiline text input
              placeholder="Optional Job Description"
              className="p-2 bg-transparent border-2 rounded-2xl focus:outline-none px-5 py-5"
              onChange={handleTextChange}
          />


          <button onClick={handleSubmit} 
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
  )
    
  };

export default DropAndButton;