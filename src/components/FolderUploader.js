import { useSelector } from "react-redux";

const FolderUploader = ({onFolderRead, isSelected, isActive}) => {
    const selectedFolder = useSelector(state => state.source.selectedFolder);
    const folderName = isSelected ? "Selected: " + selectedFolder + "/" : "Analyse all .py files in a folder (including nested folders)"

    return (
        <div className="button-section">
            <p>
                <label className={`file-upload-mask ${!isActive && "disabled"}`}>
                    <input type="file" onChange={e => onFolderRead(e, "FOLDER")} webkitdirectory="true" />
                    Select Folder
                </label>
            {isActive ? folderName : "Processing..."}
            </p>
        </div>
    );
}

export default FolderUploader;