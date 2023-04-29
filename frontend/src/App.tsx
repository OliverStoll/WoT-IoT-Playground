import Heading from "./components/Heading.tsx";
import {Section} from "./components/Section.tsx";
/*import Counter from "./components/Counter.tsx";
import List from "./components/List.tsx";*/
import FileUpload from "./components/FileUpload.tsx";

function App() {
  return (
      <>
        <Heading title={"WoT Playground"}></Heading>
        <Section title={"Simulation via Configuration"}>Upload json config</Section>
          {/*<FileUpload allowedFileTypes={['application/x-yaml', 'text/yaml']} onFilesAdded={handleFilesAdded}/>*/}
        <FileUpload allowedFileTypes={['application/json']} onFilesAdded={handleFilesAdded}/>


      </>
  )
}

function handleFilesAdded(files: File[]) {
    console.log(files)
    if (validateJson(files)){
        // toDo: post request to backend
        console.log("Sending JSON to backend")

    } else console.log("ERROR: Not a valid JSON")
}

function validateJson (files: File[]){
    return true
}


export default App
