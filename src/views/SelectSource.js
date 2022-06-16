import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { parse } from "side-lib";
import FileUploader from "../components/FileUploader";
import FolderUploader from "../components/FolderUploader";
import { setFiles } from "../redux/sourceReducer";

const SelectSource = () => {
    const [filesToProcess, setFilesToProcess] = useState([]);
    const [numFilesSelected, setNumFilesSelected] = useState(0);
    const [processedFiles, setProcessedFiles] = useState([]);

    const dispatch = useDispatch();

    const filesSelected = e => {
        e.preventDefault();
        let pyFiles = Array.from(e.target.files)
                           .filter(file => file.name.length >= 3 && file.name.slice(-3) === ".py");
        setFilesToProcess(pyFiles);  
        setNumFilesSelected(pyFiles.length);      
    }

    useEffect(() => {
        if (filesToProcess.length > 0) {
            const reader = new FileReader();
            const file = filesToProcess[0];
            reader.onload = read => {
                console.log("Files to process = " + filesToProcess.length);
                setProcessedFiles([...processedFiles, {
                    fileName: file.webkitRelativePath,
                    text: read.target.result,
                    analysis: parse(read.target.result)
                }]);

                setFilesToProcess(filesToProcess.slice(1));
            }

            reader.readAsText(file);
        } else if (processedFiles.length === numFilesSelected) {
            dispatch(setFiles(processedFiles))
        }
    }, [filesToProcess, processedFiles, numFilesSelected, dispatch]);

    return (
        <>
            <FileUploader onFileRead={filesSelected} />
            <FolderUploader onFolderRead={filesSelected} />
            {
                (numFilesSelected > 0 && filesToProcess.length > 0) &&
                    <p>Processed {numFilesSelected - filesToProcess.length} of {numFilesSelected}</p>
            }
        </>
    )
}

export default SelectSource;