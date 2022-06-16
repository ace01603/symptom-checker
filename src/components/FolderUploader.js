import { useState } from "react";
import { useDispatch } from "react-redux";
import { loadSourceFilesAsync } from '../redux/sourceReducer';

const FolderUploader = ({onFolderRead}) => {
    const dispatch = useDispatch();
    const [fileName, setFileName] = useState("Analyse all .py files in a folder (including nested folders)");

    const showFile = (e) => {
        e.preventDefault();
        let pyFiles = Array.from(e.target.files).filter(file => file.name.length >= 3 && file.name.slice(-3) === ".py");
        let fileMap = new Map();
        let fileObj = {};
        let files = [];

        for (let file of pyFiles) {
            const reader = new FileReader();
            fileMap.set(file, reader);

            reader.onload = read => {
                fileObj[file.webkitRelativePath] = read.target.result;
                files.push({
                    fileName: file.webkitRelativePath,
                    text: read.target.result
                })
                fileMap.delete(file);
                if (fileMap.size === 0) {
                    console.log(fileObj);
                    dispatch(loadSourceFilesAsync(files));
                    //setFileName(`${pyFiles.length} files selected`);
                }
            }

            reader.readAsText(file);
        }
    };

    return (
        <div className="button-section">
            <p>
                <label className="file-upload-mask">
                    <input type="file" onChange={showFile} webkitdirectory="true" />
                    Select Folder
                </label>
            {fileName}
            </p>
        </div>
    );
}

export default FolderUploader;