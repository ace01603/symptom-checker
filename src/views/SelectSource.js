import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { parse } from "side-lib";
import FileUploader from "../components/FileUploader";
import FolderUploader from "../components/FolderUploader";
import ProgressBar from "../components/ProgressBar";
import { setFiles } from "../redux/sourceReducer";

const SelectSource = () => {
    const [filesToProcess, setFilesToProcess] = useState([]);
    const [numFilesSelected, setNumFilesSelected] = useState(0);
    const [processedFiles, setProcessedFiles] = useState([]);
    const [isFileSelected, setIsFileSelected] = useState(false);
    const [isFolderSelected, setIsFolderSelected] = useState(false);

    const isActive = numFilesSelected === 0 || (numFilesSelected > 0 && filesToProcess.length === 0);

    const dispatch = useDispatch();

    const filesSelected = (e, source) => {
        e.preventDefault();
        console.log(e.target.files[0]);
        let pyFiles = Array.from(e.target.files)
                           .filter(file => file.name.length >= 3 && file.name.slice(-3) === ".py");
        setIsFileSelected(source === "FILE");
        setIsFolderSelected(source === "FOLDER");
        setFilesToProcess(pyFiles);  
        setNumFilesSelected(pyFiles.length);      
    }

    useEffect(() => {
        if (filesToProcess.length > 0) {
            const reader = new FileReader();
            const file = filesToProcess[0];
            reader.onload = read => {
                setProcessedFiles([...processedFiles, {
                    fileName: isFileSelected ? file.name : file.webkitRelativePath,
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
            <FileUploader onFileRead={filesSelected} isSelected={isFileSelected} isActive={isActive}/>
            <FolderUploader onFolderRead={filesSelected} isSelected={isFolderSelected} isActive={isActive} />
            {
                (numFilesSelected > 0 && filesToProcess.length > 0) &&
                    <ProgressBar completed={numFilesSelected - filesToProcess.length - 1} total={numFilesSelected} />
            }
        </>
    )
}

export default SelectSource;