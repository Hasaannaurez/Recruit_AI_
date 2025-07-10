import React, { useState } from "react";

const UploadResumes = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [jobId, setJobId] = useState("");

  const handleFileChange = (event) => {
    setSelectedFiles(event.target.files);
  };

  const handleUpload = async () => {
    if (!jobId || selectedFiles.length === 0) {
      alert("Please select a job ID and upload files.");
      return;
    }

    const formData = new FormData();
    formData.append("job_id", jobId);
    Array.from(selectedFiles).forEach((file) => {
      formData.append("resumes", file);
    });

    try {
      const response = await fetch("http://127.0.0.1:8000/c/upload/", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      alert(data.message);
    } catch (error) {
      console.error("Upload failed", error);
    }
  };

  return (
    <div>
      <h2>Upload Resumes</h2>
      <input
        type="text"
        placeholder="Enter Job ID"
        value={jobId}
        onChange={(e) => setJobId(e.target.value)}
      />
      <input type="file" multiple onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};

export default UploadResumes;
