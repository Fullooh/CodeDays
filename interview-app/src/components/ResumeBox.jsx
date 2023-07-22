import React, { useState } from "react";

function ResumeBox() {
    const [file, setFile] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    }

    const handleSubmit = async () => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                body: formData,
            });
        
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            } else {
                const data = await response.json();
                console.log(data.content);
            }
        } catch (error) {
            console.log(error);
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
        </div>
    )
}

export default ResumeBox;
