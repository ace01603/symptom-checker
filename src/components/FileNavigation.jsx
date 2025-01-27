import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setActiveFile, showNextFile, showPrevFile, toggleFilter, setAllFilters, changeFilterRelationship } from "../redux/sourceReducer";



const FileNavigation = () => {
    const INACTIVE_MSG = "No files uploaded."
    const NO_MATCH = "No files meet the filter criteria."
    const files = useSelector(state => state.source.files);
    const filteredFiles = useSelector(state => state.source.filteredFiles);
    const activeFile = useSelector(state => state.source.activeFile);
    const symptomFilterStatus = useSelector(state => state.source.symptomFilters);
    const symptomFilterRelationship = useSelector(state => state.source.symptomFilterRelationship);
    const misconceptionFilterStatus = useSelector(state => state.source.misconceptionFilters);
    const misconceptionFilterRelationship = useSelector(state => state.source.misconceptionFilterRelationship);

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
                            : 
                            files.length === 0 ? INACTIVE_MSG : NO_MATCH
                    }
                </div>
                <button className={`step-button next ${btnClass}`} onClick={() => dispatch(showNextFile())}></button>
            </div>
            <div className="file-filters">
                <div className={`toggle-container ${filterClass}`}>
                    <button className="toggle-button" onClick={() => setShowFilter(!showFilter)}>{showFilter ? `Hide filters (${
                                                                                                                Object.values(symptomFilterStatus).filter(val => val === true).length 
                                                                                                                + Object.values(misconceptionFilterStatus).filter(val => val === true).length
                                                                                                                } of ${
                                                                                                                Object.values(symptomFilterStatus).length + Object.values(misconceptionFilterStatus).length
                                                                                                                } options selected)` 
                                                                                                                : `Filter files (${
                                                                                                                Object.values(symptomFilterStatus).filter(val => val === true).length 
                                                                                                                 + Object.values(misconceptionFilterStatus).filter(val => val === true).length
                                                                                                                } of ${
                                                                                                                Object.values(symptomFilterStatus).length + Object.values(misconceptionFilterStatus).length
                                                                                                                } options selected)`}</button> 
                    <div className={`filter-container ${filterClass}`}>   
                        <p className="no-margin">Filter result: {filteredFiles.length} of {files.length} files</p>            
                        <div className="filter-section">
                            <div className="filter-controls">
                                <h3>Misconceptions</h3>
                                <button className="custom-btn" onClick={() => dispatch(setAllFilters({ filterBy: "misconceptions", setTo:true }))}>Select all</button>
                                <button className="custom-btn" onClick={() => dispatch(setAllFilters({ filterBy: "misconceptions", setTo:false }))}>Clear selection</button>
                            </div>
                            <p>Relationship between these filters: <input type="radio" name="miscon-filter-relationship" value="OR" id="relationship-or" checked={misconceptionFilterRelationship === "OR"} onChange={() => dispatch(changeFilterRelationship("misconceptions"))} /> <label htmlFor="relationship-or">OR</label>  <input type="radio" name="miscon-filter-relationship" value="AND" id="relationship-and" checked={misconceptionFilterRelationship === "AND"} onChange={() => dispatch(changeFilterRelationship("misconceptions"))} /> <label htmlFor="relationship-and">AND</label></p>
                            <p><em>Show files with {misconceptionFilterRelationship === "OR" ? "ANY": "ALL"} of the selected misconceptions.</em></p>
                            {
                                Object.keys(misconceptionFilterStatus).map((miscon, index) => 
                                    <p key={index}>
                                        <label htmlFor={`miscon${index}`}>
                                            <input type="checkbox" name={`miscon${index}`} value={miscon} checked={misconceptionFilterStatus[miscon]} onChange={() => dispatch(toggleFilter({ table: "misconceptions", selected:miscon }))}/>
                                            {miscon}
                                        </label>
                                    </p>
                                )
                            }
                        </div>
                        <div className="filter-section">
                            <div className="filter-controls">
                                <h3>Symptoms</h3>
                                <button className="custom-btn" onClick={() => dispatch(setAllFilters({ filterBy: "symptoms", setTo:true }))}>Select all</button>
                                <button className="custom-btn" onClick={() => dispatch(setAllFilters({ filterBy: "symptoms", setTo:false }))}>Clear selection</button>
                            </div>
                            <p>Relationship between these filters: <input type="radio" name="filter-relationship" value="OR" id="relationship-or" checked={symptomFilterRelationship === "OR"} onChange={() => dispatch(changeFilterRelationship("symptoms"))} /> <label htmlFor="relationship-or">OR</label>  <input type="radio" name="filter-relationship" value="AND" id="relationship-and" checked={symptomFilterRelationship === "AND"} onChange={() => dispatch(changeFilterRelationship("symptoms"))} /> <label htmlFor="relationship-and">AND</label></p>
                            <p><em>Show files with {symptomFilterRelationship === "OR" ? "ANY": "ALL"} of the selected symptoms. Note: misconception filters will be applied before symptom filters.</em></p>
                            {
                                Object.keys(symptomFilterStatus).map((symptom, index) => 
                                    <p key={index}>
                                        <label htmlFor={`symptom${index}`}>
                                            <input type="checkbox" name={`symptom${index}`} value={symptom} checked={symptomFilterStatus[symptom]} onChange={() => dispatch(toggleFilter({ table: "symptoms" , selected: symptom }))}/>
                                            {symptom}
                                        </label>
                                    </p>
                                )
                            }
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FileNavigation;