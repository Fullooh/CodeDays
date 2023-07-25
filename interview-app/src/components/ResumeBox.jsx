import React, { useState } from "react";

function ResumeBox() {
    const [file, setFile] = useState(null);
    const [responseData, setResponseData] = useState(null); // Holds server response
    const [isLoading, setIsLoading] = useState(false); // New state to track loading status

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    }

    const handleSubmit = async () => {
        setIsLoading(true); // Set loading to true when request starts
        const formData = new FormData();
        formData.append('file', file);

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
<<<<<<< HEAD
            <div className="flex justify-center items-center">Upload Your Resume</div>
=======
            <div className="flex justify-center items-center" style={{backgroundColor: "#EFEEEE", height: '75px'}}>Interview Stimulator</div>
>>>>>>> origin/aesha
            <input 
                type="file"
                name="name"
                placeholder="Input Resume"
                className="p-2 bg-transparent border-2 rounded-md focus:outline-none"
                onChange={handleFileChange}
            />
<<<<<<< HEAD
            <button onClick={handleSubmit} 
            className="inline-block px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300 mx-auto"
            >Submit</button>
=======
            <button onClick={handleSubmit}>Submit</button>
>>>>>>> origin/aesha

            {/* Conditionally rendering loading text or server response */}
            {isLoading ? (
                <div className="mt-5">
                    <p>Loading...</p>
                </div>
<<<<<<< HEAD
            ) : responseData ? (
                <div className="mt-5">
                  <h3 className="text-xl">Interview Questions:</h3>
                  {responseData.split('\n').map((response, index) => (
                    <div key={index} className="border p-4 rounded-lg shadow-md mb-4">
                      <p className="text-lg font-bold">Question {index + 1}</p>
                      <p>{response}</p>
                    </div>
                  ))}
                </div>
              ) : null}
=======
            ) : (
                responseData && (
                    <div className="mt-5">
                        <h3 className="text-xl">Interview Questions:</h3>
                        <p>{responseData}</p>
                    </div>
                )
            )}
>>>>>>> origin/aesha
        </div>
    )
}

export default ResumeBox;
