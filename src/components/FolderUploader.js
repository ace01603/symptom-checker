import { useState } from "react";

const FolderUploader = ({onFolderRead}) => {
    const [fileName, setFileName] = useState("Analyse all .py files in a folder (including nested folders)");

    return (
        <div className="button-section">
            <p>
                <label className="file-upload-mask">
                    <input type="file" onChange={onFolderRead} webkitdirectory="true" />
                    Select Folder
                </label>
            {fileName}
            </p>
        </div>
    );
}

export default FolderUploader;