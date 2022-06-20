import { useDispatch, useSelector } from "react-redux";
import { setActiveFile, showNextFile, showPrevFile } from "../redux/sourceReducer";

const FileNavigation = () => {
    const INACTIVE_MSG = "Error! No file selected."
    const files = useSelector(state => state.source.files);
    const activeFile = useSelector(state => state.source.activeFile);

    const btnClass = files.length === 0 ? "inactive" : "";

    const dispatch = useDispatch();

    return (
        <div className="results-container">
            <div className="file-navigation">
                <button className={`step-button prev ${btnClass}`} onClick={() => dispatch(showPrevFile())}></button>
                <div className="centre-align">
                    {
                        activeFile >= 0 ?
                            <div className="select-container">
                                <label htmlFor="file-selector" className="screenreader-only">Choose a file</label>
                                <select className="file-select" name="file-selector" value={activeFile} onChange={e => dispatch(setActiveFile(e.target.value))}>
                                    {
                                        files.map((file, index) => <option key={index} value={index} >{file.fileName}</option>)
                                    }
                                </select>
                            </div>
                            : INACTIVE_MSG
                    }
                </div>
                <button className={`step-button next ${btnClass}`} onClick={() => dispatch(showNextFile())}></button>
            </div>
            <div className="file-summary">

            </div>
        </div>
    )
}

export default FileNavigation;