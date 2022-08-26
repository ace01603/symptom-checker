import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setActiveFile, showNextFile, showPrevFile, toggleFilter, setAllFilters, changeFilterRelationship } from "../redux/sourceReducer";



const FileNavigation = () => {
    const INACTIVE_MSG = "No files uploaded."
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
        <div className="results-container settings smaller-txt">
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
                    <button className="toggle-button" onClick={() => setShowFilter(!showFilter)}>{showFilter ? `Hide filters (${Object.values(filterStatus).filter(val => val === true).length} of ${Object.values(filterStatus).length} options selected)` : `Filter files (${Object.values(filterStatus).filter(val => val === true).length} of ${Object.values(filterStatus).length} options selected)`}</button> 
                    <div className={`filter-container ${filterClass}`}>   
                        <p className="no-margin">Filter result: {filteredFiles.length} of {files.length} files</p>            
                        <div className="filter-section">
                            <div className="filter-controls">
                                <h3>Symptoms</h3>
                                <button className="custom-btn" onClick={() => dispatch(setAllFilters(true))}>Select all</button>
                                <button className="custom-btn" onClick={() => dispatch(setAllFilters(false))}>Clear selection</button>
                            </div>
                            <p>Relationship between these filters: <input type="radio" name="filter-relationship" value="OR" id="relationship-or" checked={filterRelationship === "OR"} onChange={() => dispatch(changeFilterRelationship())} /> <label htmlFor="relationship-or">OR</label>  <input type="radio" name="filter-relationship" value="AND" id="relationship-and" checked={filterRelationship === "AND"} onChange={() => dispatch(changeFilterRelationship())} /> <label htmlFor="relationship-and">AND</label></p>
                            <p><em>Show files with {filterRelationship === "OR" ? "ANY": "ALL"} of the selected symptoms.</em></p>
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
                        
                        {/*<div className="filter-section">
                            <div className="filter-controls">
                                <h3>Misc</h3>
                                <button className="custom-btn" onClick={() => dispatch(setAllMiscFilters(true))}>Select all</button>
                                <button className="custom-btn" onClick={() => dispatch(setAllMiscFilters(false))}>Clear selection</button>
                            </div>
                                <p><em>These filters are applied after the symptom filters.</em></p>
                                {
                                    Object.keys(miscFilterStatus).map((misc, index) => 
                                        <p key={index}>
                                            <label htmlFor={`misc${index}`}>
                                                <input type="checkbox" name={`misc${index}`} value={misc} checked={miscFilterStatus[misc]} 
                                                       onChange={() => dispatch(toggleMiscFilter(misc))}/>
                                                {misc}
                                            </label>
                                        </p>
                                    )
                                }
                            </div>*/}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FileNavigation;