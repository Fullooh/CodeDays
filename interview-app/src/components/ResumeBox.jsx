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
            <div className="flex justify-center items-center" style={{backgroundColor: "#EFEEEE", height: '75px'}}>Interview Simulator</div>
            <label
                className="p-2 text-black rounded-md cursor-pointer"
            >
            <input 
                type="file"
                name="name"
                placeholder="Input Resume"
                className="p-2 bg-transparent border-2 rounded-md focus:outline-none"
                onChange={handleFileChange}
            />
            </label>
            <div className="flex justify-start">
            <button onClick={handleSubmit} 
            className="inline-block px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300 ml-4"
            >Upload Your Resume
            </button>
                </div>
            {/* Conditionally rendering loading text or server response */}
            {isLoading ? (
                <div className="mt-5">
                    <p>Loading...</p>
                </div>
            ) : responseData ? (
                <div className="flex items-center">
                    <div className="max-w-md mt-4 bg-gray-100 p-4 rounded-lg shadow-md h-80 overflow-y-auto">
                    <h3 className="text-xl font-bold mb-4">Interview Questions:</h3>
                        {responseData.split('\n').map((response, index) => (
                        <div key={index} className="border p-2 rounded-lg shadow-md mb-2">
                            <p className="text-lg font-bold">Question {index + 1}</p>
                                <p>{response}</p>
                        </div>
    ))}
                    </div>
                </div>
              ) : null}
        </div>
    )
}

export default ResumeBox;
