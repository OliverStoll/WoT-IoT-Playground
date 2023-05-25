import { useDropzone } from "react-dropzone";
import './component_css/ComponentStyle.css'

const url: string = 'http://localhost:5000/api/config'
const allowedFileTypes:{} = {'application/json': ['.json']}
let type: string

/**
 Renders a file upload component with drag-and-drop functionality.
 @returns {JSX.Element} The rendered file upload component.
 */
function FileUpload(): JSX.Element {
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

/**
 Handles the files added event in the file upload component.
 @param {File[]} files - An array of File objects representing the added files.
 */
function handleFilesAdded(files: File[]) {
    if (typeof files[0] !== "undefined") {
        files[0].text().then(function (conf) {
            type = files[0].type
            if (validateConfig(conf)) {
                console.log("Sending configuration file to backend!")
                console.log(conf)
                sendPostRequest(conf).then(r => console.log(r))
            } else console.log("ERROR: Not a valid configuration file!")
        })
    } else console.log("ERROR: Not a valid configuration file!")
}


/**
 Validates a configuration string based on its type.
 @param {string} conf - The configuration string to validate.
 @returns {boolean} True if the configuration is valid, false otherwise.
 */
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



/**
 Sends a POST request to a specified URL with the provided data.
 @param {string} data - The data to include in the request body.
 @returns {Promise<string>} A promise that resolves to the response text if the request is successful.
 */
async function sendPostRequest(data: string) {
    try {
        const response: Response = await fetch(url, {
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
