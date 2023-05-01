import Heading from "./components/Heading.tsx";
import {Section} from "./components/Section.tsx";
import {FileUpload, handleFilesAdded}  from "./components/FileUpload.tsx";


function App() {
    return (
        <>
            <Heading title={"WoT Playground"}/>
            <Section title={"Simulation via Configuration"}>Upload json config</Section>
            <FileUpload allowedFileTypes={['application/json']} onFilesAdded={handleFilesAdded}/>
        </>
    )
}


export default App
