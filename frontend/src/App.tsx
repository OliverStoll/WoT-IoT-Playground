import Heading from "./components/Heading.tsx";
import {Section} from "./components/Section.tsx";
import FileUpload  from "./components/FileUpload.tsx";
import ThingRepresentation from "./components/ThingRepresentation.tsx";
import LogRepresentation from "./components/LogRepresentation.tsx";


function App() {
    return (
        <>
            <Heading title={"WoT Playground"}/>
            <Section title={"Simulation via Configuration"}>Upload configuration file</Section>
            <FileUpload/>
            <ThingRepresentation/>
            <LogRepresentation/>
        </>
    )
}


export default App
