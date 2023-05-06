import { useDropzone } from "react-dropzone";
import './ComponentStyle.css'

const url: string = 'http://localhost:5000/api/config'
const allowedFileTypes: {'': string[]} = {'application/json': ['.json']}
let type: string

function FileUpload() {
    const { getRootProps, getInputProps} = useDropzone({
        multiple: false,
        onDragEnter: undefined,
        onDragLeave: undefined,
        onDragOver: undefined,
        onDrop: handleFilesAdded,
        accept: allowedFileTypes
    })


    return (
        <div {...getRootProps()} className="file-upload-container">
            <input {...getInputProps()} />
            <p>
                Drag 'n' drop a configuration file here, or click to select file
            </p>
        </div>
    )
}

function handleFilesAdded(files: File[]) {
    console.log()
    if (typeof files[0] !== "undefined") {
        files[0].text().then(function (conf) {
            type = files[0].type
            if (validateConfig(conf)) {
                console.log("Sending configuration file to backend!")
                console.log(conf)
                sendPostRequest(url, conf).then(r => console.log(r))
            } else console.log("ERROR: Not a valid configuration file!")
        })
    } else console.log("ERROR: Not a valid configuration file!")
}

function validateConfig (conf: string){
    if (type === "application/json") {
        try {
            let o = JSON.parse(conf)
            if (o && typeof o === "object" && o !== "") {
                return true
            }
        } catch {
        }
    }
    return false
}

async function sendPostRequest(url: string, data: string) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': type },
            body: data
        })
        if (response.ok) return response.text()
        else console.log("Error: The server could not handle the request, please try again!")
    } catch {
        console.log("Error: The server could not handle the request, please try again!")
    }
}

export default FileUpload
