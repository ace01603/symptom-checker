import { useDispatch, useSelector } from 'react-redux';
import { setSourceFiles } from '../redux/sourceReducer';

const FileUploader = () => {

    const { files, activeFile } = useSelector(state => state.source);
    const fileName = activeFile > -1 ? files[activeFile].fileName : "Analyse a single .py file";

    const dispatch = useDispatch();

    const showFile = (e) => {
        e.preventDefault();
        const reader = new FileReader();
        let fileName = e.target.files[0].name;
        reader.onload = (e) => {
            const text = e.target.result;
            dispatch(setSourceFiles(
                [{
                    fileName,
                    text
                }]
            ));
        };
        reader.readAsText(e.target.files[0]);
    };
    return (
        <div className="button-section">
            <p>
                <label className="file-upload-mask">
                    <input type="file" accept=".py" onChange={showFile} />
                    Select File
                </label>
            {fileName}
            </p>
        </div>
    );
}

export default FileUploader;