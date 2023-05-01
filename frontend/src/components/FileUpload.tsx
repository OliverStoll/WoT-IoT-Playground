import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import './ComponentStyle.css'

const url: string = 'http://localhost:5000/api/config'

type FileUploadProps = {
    onFilesAdded: (files: File[]) => void
    allowedFileTypes?: string[]
};

function FileUpload(props: FileUploadProps) {
    const { onFilesAdded, allowedFileTypes } = props

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            const filteredFiles = allowedFileTypes
                ? acceptedFiles.filter((file) =>
                    allowedFileTypes.includes(file.type)
                )
                : acceptedFiles

            onFilesAdded(filteredFiles)
        },
        [allowedFileTypes, onFilesAdded]
    )

    const { getRootProps, getInputProps} = useDropzone({
        multiple: false,
        onDragEnter: undefined,
        onDragLeave: undefined,
        onDragOver: undefined,
        onDrop})


    return (
        <div {...getRootProps()} className="file-upload-container">
            <input {...getInputProps()} />
            <p>
                Drag 'n' drop a {allowedFileTypes?.join(" or ")} file here, or click to select file
            </p>
        </div>
    )
}

function handleFilesAdded(files: File[]) {
    console.log(files[0])
    if (typeof files[0] !== "undefined") {
        files[0].text().then(function (json) {
            if (validateJson(json)) {
                console.log("Sending JSON to backend!")
                console.log(json)
                sendPostRequest(url, json).then(r => console.log(r))
            } else console.log("ERROR: Not a valid JSON!")
        })
    } else console.log("ERROR: Not a valid JSON!")
}

function validateJson (json: string){
    try {
        let o = JSON.parse(json)
        if (o && typeof o === "object" && o !== "") {
            return true
        }
    }
    catch {}
    return false
}

async function sendPostRequest(url: string, data: string) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: data
        })
        if (response.ok) return response.text()
        else console.log("Error: The server could not handle the request, please try again!")
    } catch {
        console.log("Error: The server could not handle the request, please try again!")
    }
}

export {FileUpload, handleFilesAdded}
