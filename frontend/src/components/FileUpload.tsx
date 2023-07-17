import { Accept, useDropzone } from "react-dropzone"
import './component_css/FileUploadStyle.css'

const urlConfig = 'http://localhost:5001/api/config'
const urlScenario = 'http://localhost:5001/api/script'
const urlKill = 'http://localhost:5001/api/config/shutdown'

// add file types of config file here
const allowedFileTypes: Accept = {'application/json': ['.json']}
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
        <div className="file-upload-container">
            <div {...getRootProps()} className="file-upload">
                <input {...getInputProps()} />
                <p id="upload">
                    Drag 'n' drop a configuration file here, or click to select file
                </p>
            </div>
            <button id={"kill-button"} onClick={() => sendPostRequest("", urlKill).then((result: string): void => {
                // kills all devices and refreshes the application
                console.log(result)
                setTimeout(function(): void{
                    location.reload();
                }, 1000);})}>
                <img src="../../resources/exit_icon.png" id={"kill"} alt="shutdown icon"/>
            </button>
        </div>
    )
}



//--------------------------- function that handles the input file -----------------------------------------------------

/**
 Handles the files added event in the file upload component.
 @param {File[]} files - An array of File objects representing the added files.
 */
function handleFilesAdded(files: File[]): void {
    if (typeof files[0] !== "undefined") {
        files[0].text().then(function (file: string): void {
            type = files[0].type
            if (validateFile(file)) {
                // if input file is valid => check the type of the file
                const uploadDiv: HTMLElement | null = document.getElementById("upload")
                switch (checkContentType(file)){
                    // send the configuration file
                    case "config": {
                        if (uploadDiv) uploadDiv.innerText = "LOADING THINGS..."
                        sendPostRequest(file, urlConfig).then((result: string): void => {
                            //reload to show devices
                            location.reload()
                            console.log(result)
                        })
                        break
                    }
                    // send the playbook file
                    case "scenario": {
                        if (uploadDiv) uploadDiv.innerText = "RUNNING PLAYBOOK..."
                        sendPostRequest(file, urlScenario).then((result: string): void => {
                            if (uploadDiv) uploadDiv.innerText =
                                "Drag 'n' drop a playbook file here, or click to select file"
                            if (result === "Error") alert("Wrong playbook file. Please try another one.")
                        })
                        break
                    }
                    case "wrongType": {
                        alert("Please upload only one configuration file and then a scenario playbook.")
                        break
                    }
                    default: console.log("ERROR: Something went wrong! Please try again.")
                }
            }
        })
    } else console.log("ERROR: Not a valid configuration/scenario file!")
}



//---------------------------- functions that check for correct input file ---------------------------------------------

/**
 Validates if the content of the file is valid for the specific type.
 @param {string} file - The content to validate.
 @returns {boolean} True if the file is valid, false otherwise.
 */
function validateFile (file: string): boolean {
    if (type === "application/json") {
        // uploaded file was a json
        try {
            const jsonFile = JSON.parse(file)
            if (jsonFile && typeof jsonFile === "object" && jsonFile !== "") {
                return true
            }
        } catch {
            console.log("Error: Not a valid config/scenario file!")
        }
    }
    // toDo: validation of other file types
    return false
}

/**
 Checks if the uploaded file is config or a scenario file and if the files are uploaded in the correct order.
 @param {string} file - The content of the file.
 @returns {string} the content type of the file as a string or an empty string if something went wrong
 */
function checkContentType(file: string): string {
    let contentType = ""
    // if thing-container exists, we know that it is already a config uploaded
    const div: HTMLElement | null = document.getElementById("thing-container")
    //content type is json
    if (type === "application/json"){
        const content: string[] = Object.keys(JSON.parse(file))
        // the uploaded file was a configuration file, and we didn't have one before
        if (content[0] === "devices" && div && div.innerHTML == "" ) contentType = "config"
        // the uploaded file was a scenario playbook file, and we already have a config
        else if (content[0] === "steps" && div && div.innerHTML !== "") contentType = "scenario"
        // a scenario playbook was uploaded before the configuration file or another config was uploaded
        else contentType = "wrongType"
    }
    // toDo: check of other file types
    return contentType
}



//--------------------- functions for requests to backend --------------------------------------------------------------

/**
 Sends a POST request to a specified URL with the provided data.
 @param {string} data - The data to include in the request body.
 @param {string} url - Url for the api endpoint
 @returns {Promise<string>} A promise that resolves to the response text if the request is successful.
 */
async function sendPostRequest(data: string, url: string): Promise<string> {
    try {
        const response: Response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': type },
            body: data
        })
        if (response.ok) return response.text()
        return "Error"
    } catch {
        return "Error"
    }
}

export default FileUpload
