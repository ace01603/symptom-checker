import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setActiveFile, showNextFile, showPrevFile, toggleFilter, setAllFilters, changeFilterRelationship } from "../redux/sourceReducer";



const FileNavigation = () => {
    const INACTIVE_MSG = "Error! No file selected."
    const files = useSelector(state => state.source.files);
    const filteredFiles = useSelector(state => state.source.filteredFiles);
    const activeFile = useSelector(state => state.source.activeFile);
    const filterStatus = useSelector(state => state.source.filters);
    const filterRelationship = useSelector(state => state.source.filterRelationship);

    const [showFilter, setShowFilter] = useState(null);

    const btnClass = files.length === 0 ? "inactive" : "";
    const filterClass = showFilter ? "show" : showFilter === false ? "hide" : "";

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
                <div className={`toggle-container ${filterClass}`}>
                    <button className="toggle-button" onClick={() => setShowFilter(!showFilter)}>{showFilter ? `Hide filters (${Object.values(filterStatus).filter(val => val === true).length} of ${Object.values(filterStatus).length} options selected)` : `Show filters (${Object.values(filterStatus).filter(val => val === true).length} of ${Object.values(filterStatus).length} options selected)`}</button> 
                    <div className={`filter-container ${filterClass}`}>               
                        <div className="filter-controls">
                            <button className="custom-btn" onClick={() => dispatch(setAllFilters(true))}>Select all</button>
                            <button className="custom-btn" onClick={() => dispatch(setAllFilters(false))}>Clear selection</button>
                        </div>
                        <p>Filter result: {filteredFiles.length} of {files.length} files</p>
                    
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
                        <p>Relationship between filters: <input type="radio" name="filter-relationship" value="OR" id="relationship-or" checked={filterRelationship === "OR"} onChange={() => dispatch(changeFilterRelationship())} /> <label htmlFor="relationship-or">OR</label>  <input type="radio" name="filter-relationship" value="AND" id="relationship-and" checked={filterRelationship === "AND"} onChange={() => dispatch(changeFilterRelationship())} /> <label htmlFor="relationship-and">AND</label></p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FileNavigation;