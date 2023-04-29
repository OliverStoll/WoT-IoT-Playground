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
    console.log(files)
    if (validateJson(files)){
        console.log("Sending JSON to backend")
        sendPostRequest(url, files);

    } else console.log("ERROR: Not a valid JSON")
}

function validateJson (files: File[]){
    return true
}

async function sendPostRequest(url: string, data: any) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const responseData = await response.json();
        console.log(responseData);
        return responseData;
    } catch (error) {
        console.error(error);
    }
}


export default App
