import React from "react";


function ResumeBox() {
    return (
        <div className="flex flex-col mb-10 mx-auto">  
                <div className="flex justify-center items-center">Upload Your Resume</div>
                <input 
                        type= "file"
                        name="name"
                        placeholder="Input Resume"
                        className="p-2 bg-transparent border-2
                        rounded-md focus:outline-none"
                    /> 
        </div>
        
       


    )
}

export default ResumeBox;
