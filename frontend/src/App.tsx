import Heading from "./components/Heading.tsx";
import {Section} from "./components/Section.tsx";
import FileUpload from "./components/FileUpload.tsx";

const url = 'http://localhost:5000/api/config';

function App() {
    return (
        <>
            <Heading title={"WoT Playground"}></Heading>
            <Section title={"Simulation via Configuration"}>Upload json config</Section>
            <FileUpload allowedFileTypes={['application/json']} onFilesAdded={handleFilesAdded}/>
        </>
    )
}

function handleFilesAdded(files: File[]) {
    files[0].text().then(function(json) {
        if (validateJson(json)){
            console.log("Sending JSON to backend")
            console.log(json)
            console.log(sendPostRequest(url, json));

        } else console.log("ERROR: Not a valid JSON")
    });
}

function validateJson (json: string){
    return true
}

async function sendPostRequest(url: string, data: string) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: data
        });
        const responseData = await response;
        console.log(responseData);
        return responseData;
    } catch (error) {
        console.error(error);
    }
}


export default App