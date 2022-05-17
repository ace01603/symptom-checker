import { useState } from "react";
import FileUploader from "../components/FileUploader";
import ShowFile from "../components/ShowFile";


const App = () => {
    const [fileContents, setFileContents] = useState("");
    const [activeFile, setActiveFile] = useState("no file selected");

    const fileSelect = (fileName, contents) => {
        setFileContents(contents);
        setActiveFile(fileName);
    }

    return (
        <div className="page-container">
            <header>
                <h1>Symptom Checker</h1>
            </header>
            <main>
                <FileUploader onFileRead={fileSelect} />
                <ShowFile fileContents={fileContents} />
            </main>
        </div>
    );
}

export default App;
