import { useEffect, /*useState*/ } from "react";
import { useSelector, useDispatch } from "react-redux";
import { disableRedirect } from "../redux/statusReducer";
import { setAllFiltersAndShowFile } from "../redux/sourceReducer";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { sympInfo } from "../content/symptomInfo";
import { misconInfo, conInfo } from "../content/misconceptionInfo";
import { faSort } from "@fortawesome/free-solid-svg-icons";
import { summarySortBy } from "../redux/statusReducer";
import { Navigate } from "react-router-dom";

const Summary = () => {
    const files = useSelector(state => state.source.files);
    const redirect = useSelector(state => state.status.navigateToResults);
    const redirectToFileView = useSelector(state => state.status.navigateToFileView);
    const colSortSymptoms = useSelector(state => state.status.summarySortSymptoms);
    const colSortMisconceptions = useSelector(state => state.status.summarySortMisconceptions);
    const colSortConcepts = useSelector(state => state.status.summarySortConcepts);

    //const [fileCountFilter, setFileCountFilter] = useState(0);

    const dispatch = useDispatch();

    useEffect(() => {
        if (redirect) {
            dispatch(disableRedirect());
        }
    }, [dispatch, redirect]);

    const createSymptomObj = fileIndex => ({
        totalOccurrences: 1,
        files: {
            [fileIndex]: 1
        },
        affectedFiles: 1,
        // occursWith: [...new Set(files[fileIndex].analysis.symptoms.map(s => s.type))] // get unique symptom types from files[fileIndex]
    });

    const createMisconceptionObj = fileIndex => ({
        files: {
            [fileIndex]: 1
        },
        affectedFiles: 1,
        // occursWith: [...new Set(files[fileIndex].analysis.misconceptions.map(m => m.type))] // get unique misconception types for this file
    });

    const createConceptObj = fileIndex => ({
        files: {
            [fileIndex]: 1
        },
        affectedFiles: 1
    });

    const getFileCounts = (obj, fileIndex) => {
        if (obj.files.fileIndex !== undefined) { // obj.files.hasOwnProperty(fileIndex)
            return {
                ...obj.files, [fileIndex]: obj.files[fileIndex] + 1
            }
        } else {
            return { ...obj.files, [fileIndex]: 1 };
        }
    }
    
    const addSymptomOccurrence = (symptomObj, fileIndex) => {
        const fileCounts = getFileCounts(symptomObj, fileIndex);
        return {
            totalOccurrences: symptomObj.totalOccurrences+1,
            files: fileCounts,
            affectedFiles: Object.keys(fileCounts).length
        }
    };

    const addMisconceptionOccurrence = (misconObj, fileIndex) => {
        const fileCounts = getFileCounts(misconObj, fileIndex);
        return {
            files: fileCounts,
            affectedFiles: Object.keys(fileCounts).length
        }
    }

    const addConceptOccurrence = (conceptObj, fileIndex) => {
        const fileCounts = getFileCounts(conceptObj, fileIndex);
        return {
            files: fileCounts,
            affectedFiles: Object.keys(fileCounts).length
        }
    }

    const sortByKey = (column, dataArr, sortOrder) => {
        dataArr.sort((a, b) => {
            if (a[1][column] === b[1][column]) return 0;
            else if (a[1][column] < b[1][column]) return -1 * sortOrder[column];
            else return sortOrder[column];
        })
    }

    const updateTableSort = (sortOrder, dataArr) => {
        if (sortOrder.ID !== 0) {
            dataArr.sort((a, b) => {
                if (a[0] === b[0]) return 0;
                else if (a[0] < b[0]) return -1 * sortOrder.ID;
                else return sortOrder.ID;
            });
        } else {
            for (const [key, value] of Object.entries(sortOrder)) {
                if (value !== 0) {
                    sortByKey(key, dataArr, sortOrder);
                    break;
                }
            }
        }
    }

    
    const makeMisconSummaryTable = () => {
        let misconMap = new Map();
        for (let fileIndex in files) {
            for (let miscon of files[fileIndex].analysis.misconceptions) {
                if (!misconMap.has(miscon.type)) misconMap.set(miscon.type, createMisconceptionObj(fileIndex));
                else {
                    misconMap.set(miscon.type, addMisconceptionOccurrence(misconMap.get(miscon.type), fileIndex));
                }
            }
        }
        let misconArr = Array.from(misconMap);
        updateTableSort(colSortMisconceptions, misconArr);
        return misconArr;
    }

    const makeConceptSummaryTable = () => {
        let conceptMap = new Map();
        for (let fileIndex in files) {
            for (let concept of files[fileIndex].analysis.concepts) {
                if (!conceptMap.has(concept.type)) conceptMap.set(concept.type, createConceptObj(fileIndex));
                else {
                    conceptMap.set(concept.type, addConceptOccurrence(conceptMap.get(concept.type), fileIndex));
                }
            }
        }
        let conceptArr = Array.from(conceptMap);
        updateTableSort(colSortConcepts, conceptArr);
        return conceptArr;
    }

    /**
     * 
     * @returns An array of arrays with the shape [symptom name, summary object]
     */
    const makeSymptomSummaryTable = () => {
        let symptomMap = new Map();
        for (let fileIndex in files) {
            for (let symptom of files[fileIndex].analysis.symptoms) {
                const symptomType = symptom.type;
                if (!symptomMap.has(symptomType)) symptomMap.set(symptomType, createSymptomObj(fileIndex));
                else {
                    symptomMap.set(symptomType, addSymptomOccurrence(symptomMap.get(symptomType), fileIndex));
                }
            }
        }
        let symptomArr = Array.from(symptomMap);
        updateTableSort(colSortSymptoms, symptomArr);
        return symptomArr;
    }

    /*const computeComparisons = symptomArr => {
        const comparisonArr = [];
        for (let symptom of symptomArr) {
            comparisonArr.push({
                name: symptom[0],
                affectedFiles: symptom[1].affectedFiles,
                // occursWith: [{co-occuring symptom name, fileCount, percent of first symptom}]
                occursWith: Object.entries(symptom[1].occursWith.reduce((obj, curr) => {
                                        obj[curr] = obj.curr !== undefined ? // obj.hasOwnProperty(curr)
                                                        {
                                                            fileCount: obj[curr].fileCount + 1,
                                                            percentOfFirstSymptom: (obj[curr].fileCount + 1) / symptom[1].affectedFiles * 100
                                                        } 
                                                        : 
                                                        {
                                                            fileCount: 1,
                                                            percentOfFirstSymptom: 1 / symptom[1].affectedFiles * 100
                                                        }; //obj[curr] + 1 : 1;
                                        return obj
                                    }, {}))
                                    .filter(companion => companion[0] !== symptom[0])
                                    .sort((a, b) => {
                                        if (a[1].percentOfFirstSymptom > b[1].percentOfFirstSymptom) return -1;
                                        else if (a[1].percentOfFirstSymptom === b[1].percentOfFirstSymptom) return 0;
                                        else return 1;
                                    })
            })
        }
        return comparisonArr;
    }*/

    const symptomArr = makeSymptomSummaryTable();
    const misconArr = makeMisconSummaryTable();
    const conceptArr = makeConceptSummaryTable();

    if (files.length === 0) {
        return <>
            {
                redirectToFileView && 
                    <Navigate to="/file-view"/>
            }
            <p>No source to summarise!</p>
        </>
    }
    else {
        return (
            <>
                {
                    redirectToFileView && 
                        <Navigate to="/file-view"/>
                }
                <div className="basic-container">
                    <h2>Misconception Counts</h2>
                    <table className="results-table">
                        <thead>
                            <tr>
                                <th onClick={() => dispatch(summarySortBy({ table: "misconceptions", column: "ID" }))}>Misconception ID <FontAwesomeIcon icon={faSort} /></th>
                                <th onClick={() => dispatch(summarySortBy({ table: "misconceptions", column: "affectedFiles" }))}># of files <FontAwesomeIcon icon={faSort} /></th>
                                <th onClick={() => dispatch(summarySortBy({ table: "misconceptions", column: "affectedFiles" }))}>% of files <FontAwesomeIcon icon={faSort} /></th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                misconArr.map((miscon, index) => 
                                        <tr key={index}>
                                            <td>
                                                <div className="tooltip" onClick={() => dispatch(setAllFiltersAndShowFile({ table: "misconceptions", selected: miscon[0] }))}>
                                                    {miscon[0]}
                                                    <div className="tooltip-text"><p>{misconInfo[miscon[0]]}</p><p className="small">Click the misconception name to view files containing this misconception.</p></div>
                                                </div>
                                            </td>
                                            <td>{miscon[1].affectedFiles}</td>
                                            <td>{(miscon[1].affectedFiles / files.length * 100).toFixed(2)}</td>
                                        </tr>
                                )
                            }
                        </tbody>
                    </table>
                    <h2>Symptom Counts</h2>
                    <table className="results-table">
                        <thead>
                            <tr>
                                <th onClick={() => dispatch(summarySortBy({ table: "symptoms", column: "ID" }))}>Symptom ID <FontAwesomeIcon icon={faSort} /></th>
                                <th onClick={() => dispatch(summarySortBy({ table: "symptoms", column:"totalOccurrences" }))}>Total occurrences <FontAwesomeIcon icon={faSort} /></th>
                                <th onClick={() => dispatch(summarySortBy({ table: "symptoms", column:"affectedFiles" }))}># of files <FontAwesomeIcon icon={faSort} /></th>
                                <th onClick={() => dispatch(summarySortBy({ table: "symptoms", column:"affectedFiles" }))}>% of files <FontAwesomeIcon icon={faSort} /></th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                symptomArr.map((symptom, index) => 
                                        <tr key={index}>
                                            <td><div className="tooltip" onClick={() => dispatch(setAllFiltersAndShowFile({ table: "symptoms", selected: symptom[0] }))}>{symptom[0]}<div className="tooltip-text">{sympInfo[symptom[0]]}<p className="small">Click the symptom name to view files containing this symptom.</p></div></div></td>
                                            <td>{symptom[1].totalOccurrences}</td>
                                            <td>{symptom[1].affectedFiles}</td>
                                            <td>{(symptom[1].affectedFiles / files.length * 100).toFixed(2)}</td>
                                        </tr>
                                )
                            }
                        </tbody>
                    </table>
                    <h2>Concept Counts</h2>
                    <table className="results-table">
                        <thead>
                            <tr>
                                <th onClick={() => dispatch(summarySortBy({ table: "concepts", column: "ID" }))}>Concept ID <FontAwesomeIcon icon={faSort} /></th>
                                <th onClick={() => dispatch(summarySortBy({ table: "concepts", column: "affectedFiles" }))}># of files <FontAwesomeIcon icon={faSort} /></th>
                                <th onClick={() => dispatch(summarySortBy({ table: "concepts", column: "affectedFiles" }))}>% of files <FontAwesomeIcon icon={faSort} /></th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                conceptArr.map((con, index) => 
                                        <tr key={index}>
                                            <td>
                                                <div className="tooltip" onClick={() => dispatch(setAllFiltersAndShowFile({ table: "concepts", selected: con[0] }))}>
                                                    {con[0]}
                                                    <div className="tooltip-text"><p>{conInfo[con[0]]}</p><p className="small">Click the concept name to view files containing this concept.</p></div>
                                                </div>
                                            </td>
                                            <td>{con[1].affectedFiles}</td>
                                            <td>{(con[1].affectedFiles / files.length * 100).toFixed(2)}</td>
                                        </tr>
                                )
                            }
                        </tbody>
                    </table>
                </div>
            </>
        )
    }
}

export default Summary;