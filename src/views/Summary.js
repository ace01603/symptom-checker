import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { disableRedirect } from "../redux/statusReducer";
import { setAllFiltersAndShowFile } from "../redux/sourceReducer";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { combinedSymptoms, symptomInfo } from "../content/symptomInfo";
import { faSort } from "@fortawesome/free-solid-svg-icons";
import { summarySortBy } from "../redux/statusReducer";
import { Navigate } from "react-router-dom";

const Summary = () => {
    const files = useSelector(state => state.source.files);
    const redirect = useSelector(state => state.status.navigateToResults);
    const redirectToFileView = useSelector(state => state.status.navigateToFileView);
    const colSort = useSelector(state => state.status.summarySort);

    const [fileCountFilter, setFileCountFilter] = useState(0);

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
        occursWith: [...new Set(files[fileIndex].analysis.symptoms.map(s => lookupSymptomType(s)))] // get unique symptom types from files[fileIndex]
    });

    const lookupSymptomType = symptom => combinedSymptoms.hasOwnProperty(symptom.type) ? combinedSymptoms[symptom.type] : symptom.type;

    const addOccurrence = (symptomObj,fileIndex) => {
        let fileCounts;
        let occursWith = [];
        if (symptomObj.files.hasOwnProperty(fileIndex)) {
            fileCounts = {
                ...symptomObj.files, [fileIndex]: symptomObj.files[fileIndex] + 1
            }
            
        } else {
            fileCounts = {...symptomObj.files, [fileIndex]: 1};
            occursWith = [...new Set(files[fileIndex].analysis.symptoms.map(s => lookupSymptomType(s)))]
        }
        return {
            totalOccurrences: symptomObj.totalOccurrences+1,
            files: fileCounts,
            affectedFiles: Object.keys(fileCounts).length,
            occursWith: symptomObj.occursWith.concat(occursWith)
        }
    };

    const sortPropHelper = (symptomArr, prop) => {
        symptomArr.sort((a, b) => {
            if (a[1][prop] === b[1][prop]) return 0;
            else if (a[1][prop] < b[1][prop]) return -1 * colSort[prop];
            else return colSort[prop];
        })
    }

    const updateSort = symptomArr => {
        if (colSort.ID !== 0) {
            symptomArr.sort((a, b) => {
                if (a[0] === b[0]) return 0;
                else if (a[0] < b[0]) return -1 * colSort.ID;
                else return colSort.ID;
            });
        } else if (colSort.totalOccurrences !== 0) {
            sortPropHelper(symptomArr, "totalOccurrences");
        } else if (colSort.affectedFiles !== 0) {
            sortPropHelper(symptomArr, "affectedFiles");
        }
    }

    /**
     * 
     * @returns An array of arrays with the shape [symptom name, summary object]
     */
    const makeSummaryTable = () => {
        let symptomMap = new Map();
        for (let fileIndex in files) {
            for (let symptom of files[fileIndex].analysis.symptoms) {
                const symptomType = lookupSymptomType(symptom);
                if (!symptomMap.has(symptomType)) symptomMap.set(symptomType, createSymptomObj(fileIndex));
                else {
                    symptomMap.set(symptomType, addOccurrence(symptomMap.get(symptomType), fileIndex));
                }
            }
        }
        let symptomArr = Array.from(symptomMap);
        updateSort(symptomArr);
        return symptomArr;
    }

    const computeComparisons = symptomArr => {
        const comparisonArr = [];
        for (let symptom of symptomArr) {
            comparisonArr.push({
                name: symptom[0],
                affectedFiles: symptom[1].affectedFiles,
                // occursWith: [{co-occuring symptom name, fileCount, percent of first symptom}]
                occursWith: Object.entries(symptom[1].occursWith.reduce((obj, curr) => {
                                        obj[curr] = obj.hasOwnProperty(curr) ? 
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
    }

    const symptomArr = makeSummaryTable();
    const symptomComparisons = computeComparisons(symptomArr);

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
                    <h2>Symptom Counts</h2>
                    <table className="results-table">
                        <thead>
                            <tr>
                                <th onClick={() => dispatch(summarySortBy("ID"))}>Symptom ID <FontAwesomeIcon icon={faSort} /></th>
                                <th onClick={() => dispatch(summarySortBy("totalOccurrences"))}>Total occurrences <FontAwesomeIcon icon={faSort} /></th>
                                <th onClick={() => dispatch(summarySortBy("affectedFiles"))}># of files <FontAwesomeIcon icon={faSort} /></th>
                                <th onClick={() => dispatch(summarySortBy("affectedFiles"))}>% of files <FontAwesomeIcon icon={faSort} /></th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                symptomArr.map((symptom, index) => 
                                        <tr key={index}>
                                            <td><div className="tooltip" onClick={() => dispatch(setAllFiltersAndShowFile(symptom[0]))}>{symptom[0]}<div className="tooltip-text">{symptomInfo[symptom[0]]}<p className="small">Click the symptom name to view files containing this symptom.</p></div></div></td>
                                            <td>{symptom[1].totalOccurrences}</td>
                                            <td>{symptom[1].affectedFiles}</td>
                                            <td>{(symptom[1].affectedFiles / files.length * 100).toFixed(2)}</td>
                                        </tr>
                                )
                            }
                        </tbody>
                    </table>
                    <h2>Co-occurring Symptoms</h2>
                    <p><label>Show results for symptoms that occur in at least <input type="number" name="file-count-filter" value={fileCountFilter} onChange={e => setFileCountFilter(e.target.value)} /> files</label></p>
                    {
                        symptomComparisons.filter(symptom => symptom.affectedFiles >= fileCountFilter).map((symptom, i) => 
                            <div key={i}>
                                <h3>{symptom.name}</h3>
                                <table className="results-table no-sort">
                                    <thead>
                                        <tr>
                                            <th>Occurs with...</th>
                                            <th>...in # files</th>
                                            <th>% of files containing {symptom.name}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            symptom.occursWith.map((companion, sub_i) =>
                                                        <tr key={`${i}_${sub_i}`}>
                                                            <td>{companion[0]}</td>
                                                            <td>{companion[1].fileCount}</td>
                                                            <td>{companion[1].percentOfFirstSymptom.toFixed(2)}</td>
                                                        </tr>
                                            )
                                        }
                                    </tbody>
                                </table>
                            </div>
                        )
                    }
                </div>
            </>
        )
    }
}

export default Summary;