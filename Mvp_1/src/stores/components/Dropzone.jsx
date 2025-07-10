import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import '../CssFiles/Dropzone.css';

const Dropzone = ({ onFilesAdded }) => {
    const onDrop = useCallback(acceptedFiles => {
        const pdfFiles = acceptedFiles.filter((file) => file.type === "application/pdf");
        console.log("Newly Added Files Count:", pdfFiles.length); // Debugging
        onFilesAdded(pdfFiles);
    }, [onFilesAdded]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: 'application/pdf',
        multiple: true, // Allow multiple files
    });

    return (
        <form>
            <div {...getRootProps()} className="dropzone">
                <input {...getInputProps()} />
                {
                    isDragActive ? 
                    <p>Drop the files here ...</p> :
                    <p>Drag 'n' drop some files here, or click to select files</p>
                }
            </div>
        </form>
    );
};

export default Dropzone;
