import Heading from "./components/Heading.tsx";
import {Section} from "./components/Section.tsx";
/*import Counter from "./components/Counter.tsx";
import List from "./components/List.tsx";*/
import FileUpload from "./components/FileUpload.tsx";

function App() {
  return (
      <>
        <Heading title={"WoT Playground"}></Heading>
        <Section title={"Simulation via Configuration"}>Upload YAML config</Section>
        {/*<Counter/>
          <List items={["Thing1", "Thing2", "Thing3"]} render={(item: string) =>
              <span className="bold">{item}</span>}/>*/}
        <FileUpload allowedFileTypes={['application/x-yaml', 'text/yaml']} onFilesAdded={handleFilesAdded}/>


      </>
  )
}

function handleFilesAdded(files: File[]) {
    console.log(files);
    // do something with the files
}


export default App
