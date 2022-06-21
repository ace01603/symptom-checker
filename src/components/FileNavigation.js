import { useDispatch, useSelector } from "react-redux";
import { setActiveFile, showNextFile, showPrevFile, toggleFilter } from "../redux/sourceReducer";



const FileNavigation = () => {
    const INACTIVE_MSG = "Error! No file selected."
    const files = useSelector(state => state.source.files);
    const filteredFiles = useSelector(state => state.source.filteredFiles);
    const activeFile = useSelector(state => state.source.activeFile);
    const filterStatus = useSelector(state => state.source.filters);

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
                                        filteredFiles.map((fileIndex, filteredIndex) => <option key={filteredIndex} value={filteredIndex} >{files[fileIndex].fileName}</option>)
                                    }
                                </select>
                            </div>
                            : INACTIVE_MSG
                    }
                </div>
                <button className={`step-button next ${btnClass}`} onClick={() => dispatch(showNextFile())}></button>
            </div>
            <div className="file-filters">
                <button>Filter by symptom</button>
                <p>{files.length} files found</p>
                <div className="filter-container">
                    {
                        Object.keys(filterStatus).map((symptom, index) => 
                            <p key={index}>
                                <label htmlFor={`symptom${index}`}>
                                    <input type="checkbox" name={`symptom${index}`} value={symptom} checked={filterStatus[symptom]} onChange={() => dispatch(toggleFilter(symptom))}/>
                                    {symptom}
                                </label>
                            </p>
                        )
                    }
                </div>
            </div>
        </div>
    )
}

export default FileNavigation;