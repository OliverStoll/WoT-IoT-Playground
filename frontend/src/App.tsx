import Heading from "./components/Heading.tsx";
import FileUpload  from "./components/FileUpload.tsx";
import ThingRepresentation from "./components/ThingRepresentation.tsx";
import LogRepresentation from "./components/LogRepresentation.tsx";


function App() {
    return (
        <>
            <Heading title={"WoT Playground"}/>
            <FileUpload/>
            <ThingRepresentation/>
            <LogRepresentation/>
        </>
    )
}


export default App
