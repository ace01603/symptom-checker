import { useSelector } from 'react-redux';

const FileUploader = ({onFileRead}) => {

    const { files, activeFile } = useSelector(state => state.source);
    const fileName = activeFile > -1 ? files[activeFile].fileName : "Analyse a single .py file";

    return (
        <div className="button-section">
            <p>
                <label className="file-upload-mask">
                    <input type="file" accept=".py" onChange={onFileRead} />
                    Select File
                </label>
            {fileName}
            </p>
        </div>
    );
}

export default FileUploader;