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
            <div className="flex justify-center items-center">Upload Your Resume</div>
            <input 
                type="file"
                name="name"
                placeholder="Input Resume"
                className="p-2 bg-transparent border-2 rounded-md focus:outline-none"
                onChange={handleFileChange}
            />
            <button onClick={handleSubmit}>Submit</button>

            {/* Conditionally rendering loading text or server response */}
            {isLoading ? (
                <div className="mt-5">
                    <p>Loading...</p>
                </div>
            ) : (
                responseData && (
                    <div className="mt-5">
                        <h3 className="text-xl">Interview Questions:</h3>
                        <p>{responseData}</p>
                    </div>
                )
            )}
        </div>
    )
}

export default ResumeBox;
