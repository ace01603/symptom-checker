import { useState } from "react";
import FileUploader from "../components/FileUploader";
import ShowFile from "../components/ShowFile";
import { parse } from "side-lib";


const App = () => {
    const [fileContents, setFileContents] = useState("");
    const [activeFile, setActiveFile] = useState("");
    const [symptoms, setSymptoms] = useState([]);

    const fileSelect = (fileName, contents) => {
        const results = parse(contents);
        setFileContents(contents);
        setActiveFile(fileName);
        setSymptoms(results.symptoms);
    }

    return (
        <div className="page-container">
            <header>
                <h1>Symptom Checker</h1>
            </header>
            <main>
                <FileUploader onFileRead={fileSelect} />
                <ShowFile fileContents={fileContents} symptoms={symptoms} />
            </main>
        </div>
    );
}

export default App;
