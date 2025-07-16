import { useState } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import FileUploader from "../components/FileUploader";
import FolderUploader from "../components/FolderUploader";
import ProgressBar from "../components/ProgressBar";
// import { setFiles } from "../redux/sourceReducer";

const SelectSource = ({processFiles}) => {
    
    // const [filesToProcess, setFilesToProcess] = useState([]);
    const [numFilesSelected, setNumFilesSelected] = useState(0);
    // const [processedFiles, setProcessedFiles] = useState([]);
    const [isFileSelected, setIsFileSelected] = useState(false);
    const [isFolderSelected, setIsFolderSelected] = useState(false);

    const redirect = useSelector(state => state.status.navigateToResults);
    const processCount = useSelector(state => state.source.filesToProcessCount);

    const isActive = numFilesSelected === 0 || (numFilesSelected > 0 && processCount === 0);

    //const dispatch = useDispatch();

    const filesSelected = (e, source) => {
        e.preventDefault();
        let pyFiles = Array.from(e.target.files)
                           .filter(file => file.name.length >= 3 && file.name.slice(-3) === ".py");
        setIsFileSelected(source === "FILE");
        setIsFolderSelected(source === "FOLDER");
        setNumFilesSelected(pyFiles.length);
        // New approach
        processFiles(pyFiles);
    }

    return (
        <>
            {
                redirect && 
                    <Navigate to="/summary"/>
            }
            <FileUploader onFileRead={filesSelected} isSelected={isFileSelected} isActive={isActive}/>
            <FolderUploader onFolderRead={filesSelected} isSelected={isFolderSelected} isActive={isActive} />
            {
                (numFilesSelected > 0 && processCount > 0) &&
                    <ProgressBar completed={numFilesSelected - processCount} total={numFilesSelected} />
            }
        </>
    )
}

export default SelectSource;