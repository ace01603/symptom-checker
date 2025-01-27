import SelectSource from "./SelectSource.jsx";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import Results from "./Results";
import Summary from "./Summary";
import About from "./About";
import { useEffect, useState } from "react";
import { parse } from "side-lib";
import { useDispatch } from "react-redux";
import { setFileProcessCount, setFiles } from "../redux/sourceReducer.js";

// console.log(parse('name = print("hi")'))

const App = () => {
    const location = useLocation();

    // File upload
    const [filesToProcess, setFilesToProcess] = useState([]);
    const [processedFiles, setProcessedFiles] = useState([]);

    const dispatch = useDispatch();

    // HERE Problem might be calling parse client side
    // Try storing file text then processing on the back end - redux async
    // NOPE
    // Try creating a new Next React app that just calls SIDE-lib

    useEffect(() => {
        if (filesToProcess.length > 0) {
            const localProcessedFiles = [];

            const readAndConvert = (rawFiles) => {
                dispatch(setFileProcessCount(rawFiles.length));
                const reader = new FileReader();
                const file = rawFiles[0];
                const remainingFiles = rawFiles.slice(1);
                reader.addEventListener("load", read => {
                    const fileText = read.target.result;
                    const fileName = file.webkitRelativePath === "" ? file.name : file.webkitRelativePath;
                    console.log("parsing", fileName);
                    localProcessedFiles.push({
                        fileName,
                        text: fileText,
                        analysis: parse(fileText)
                    });
                    if (remainingFiles.length > 0) {
                        readAndConvert(remainingFiles);
                    } else {
                        console.log("Processed", localProcessedFiles.length);
                        dispatch(setFiles(localProcessedFiles));
                    }
                });
                reader.readAsText(file);
            }

            readAndConvert([...filesToProcess]);

            // const reader = new FileReader();
            // const file = filesToProcess[0];
            //         reader.onload = read => {
            //             const fileText = read.target.result;
            //             // TODO: Move processing into tracking of files to process into parent to prevent reload
            //             setProcessedFiles([...processedFiles, {
            //                 fileName: file.webkitRelativePath === "" ? file.name : file.webkitRelativePath,
            //                 text: read.target.result,
            //                 analysis: parse(fileText)
            //             }]);

            //             setFilesToProcess(filesToProcess.slice(1));
            //         }

            //         reader.readAsText(file);
                // } else if (processedFiles.length === numFilesSelected && numFilesSelected > 0) {
                //     dispatch(setFiles(processedFiles));
                // }
        }
    }, [filesToProcess]);

    return (
        <div className="page-container">
            <header>
                <h1>Supportive IDE: Symptom Checker</h1>
            </header>
            <nav>
                <ul className="navigation" role="menubar" aria-label="Main Menu">
                    <li role="none" className={`active ${(location.pathname === `/` || location.pathname === `/about`) && "current"}`}>
                        <Link to={`/about`}>About</Link>
                    </li>
                    <li role="none" className={`active ${location.pathname === `/select-source` && "current"}`}>
                        <Link to={`/select-source`}>Select Source</Link>
                    </li>
                    <li role="none" className={`active ${location.pathname === `/summary` && "current"}`}>
                        <Link to="/summary">Summary</Link>
                    </li>
                    <li role="none" className={`active ${location.pathname === `/file-view` && "current"}`}>
                        <Link to="/file-view">File View</Link>
                    </li>
                </ul>
            </nav>
            <main>
                <Routes>
                    <Route path="/about" element={<About />} />
                    <Route path="/select-source" element={<SelectSource filesToProcess={filesToProcess.length} processFiles={(files) => setFilesToProcess(files)} />} />
                    <Route path = "/file-view" element={<Results />} />
                    <Route path="/summary" element={<Summary />} />
                    <Route path="/" element={<About />} /> 
                </Routes>
            </main>
        </div>
    );
}

export default App;
