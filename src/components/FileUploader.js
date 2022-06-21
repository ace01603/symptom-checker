import { useSelector } from 'react-redux';

const FileUploader = ({onFileRead, isSelected, isActive}) => {

    const files = useSelector(state => state.source.files);
    const activeFile = useSelector(state => state.source.activeFile)
    const fileName = activeFile > -1 && isSelected ? "Selected: " + files[activeFile].fileName : "Analyse a single .py file";
    
    return (
        <div className="button-section">
            <p>
                <label className={`custom-btn ${!isActive && "disabled"}`}>
                    <input type="file" accept=".py" onChange={e => onFileRead(e, "FILE")} />
                    Select File
                </label>
            {fileName}
            </p>
        </div>
    );
}

export default FileUploader;