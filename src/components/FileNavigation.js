import { useDispatch, useSelector } from "react-redux";
import { showNextFile, showPrevFile } from "../redux/sourceReducer";

const FileNavigation = () => {
    const INACTIVE_MSG = "Error! No file selected."
    const files = useSelector(state => state.source.files);
    const activeFile = useSelector(state => state.source.activeFile);
    const fileName = activeFile >= 0 && files.length > 0 ? files[activeFile].fileName : INACTIVE_MSG;

    const btnClass = files.length === 0 ? "inactive" : "";

    const dispatch = useDispatch();

    return (
        <div className="results-container">
            <div className="file-navigation">
                <button className={`step-button prev ${btnClass}`} onClick={() => dispatch(showPrevFile())}></button>
                <div className="centre-align">{fileName}</div>
                <button className={`step-button next ${btnClass}`} onClick={() => dispatch(showNextFile())}></button>
            </div>
            <div className="file-summary">

            </div>
        </div>
    )
}

export default FileNavigation;