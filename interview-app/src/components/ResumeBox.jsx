import React, { useState } from "react";

function ResumeBox() {
    const [file, setFile] = useState(null);
    const [text, setText] = useState(''); // Holds the user's optional text input
    const [responseData, setResponseData] = useState(null); // Holds server response
    const [errorMessage, setErrorMessage] = useState(null); // Holds server error
    const [isLoading, setIsLoading] = useState(false); // New state to track loading status

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setResponseData(null);
        setErrorMessage(null);
    }

    const handleTextChange = (e) => {
        setText(e.target.value);
    }

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
            <div className="flex justify-center items-center" style={{backgroundColor: "#EFEEEE", height: '75px'}}>Interview Simulator</div>
    
            <input 
                type="file"
                name="name"
                placeholder="Input Resume"
                className="p-2 bg-transparent border-2 rounded-md focus:outline-none"
                onChange={handleFileChange}
            />

            <textarea
                placeholder="Optional Job Description"
                className="p-2 bg-transparent border-2 rounded-md focus:outline-none"
                onChange={handleTextChange}
            />
            
            <button onClick={handleSubmit}>Submit</button>

            {/* Conditionally rendering loading text, server response or error message */}
            {isLoading ? (
                <div className="mt-5">
                    <p>Loading...</p>
                </div>
            ) : (
                <div className="mt-5">
                    {responseData ? (
                        <div>
                            <h3 className="text-xl">Interview Questions:</h3>
                            {responseData.split('\n').map((response, index) => (
                                <div key={index} className="border p-4 rounded-lg shadow-md mb-4">
                                    <p className="text-lg font-bold">Question {index + 1}</p>
                                    <p>{response}</p>
                                </div>
                            ))}
                        </div>
                    ) : null}

                    {errorMessage ? (
                        <div>
                            <h3 className="text-xl">Error:</h3>
                            <p>{errorMessage}</p>
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
}

export default ResumeBox;
