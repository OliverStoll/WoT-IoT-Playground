import Heading from "./components/Heading.tsx";
import {Section} from "./components/Section.tsx";
import FileUpload  from "./components/FileUpload.tsx";


function App() {
    return (
        <>
            <Heading title={"WoT Playground"}/>
            <Section title={"Simulation via Configuration"}>Upload configuration file</Section>
            <FileUpload/>
        </>
    )
}


export default App
