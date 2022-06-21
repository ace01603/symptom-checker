import { useEffect, useReducer } from "react";
import { useSelector, useDispatch } from "react-redux";
import { disableRedirect } from "../redux/statusReducer";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { combinedSymptoms } from "../content/symptomInfo";
import { faSort } from "@fortawesome/free-solid-svg-icons";

// 0 = no sort, 1 = ASC, -1 = DESC

const initialState = {
    ID: 0,
    totalOccurrences: 0,
    affectedFiles: 0
}

const sortStateReducer = (state, action) => {
    if (!state.hasOwnProperty(action.type)) throw new Error("Couldn't sort!");
    let newState = {};
    for (let key of Object.keys(state)) {
        if (key === action.type) newState[key] = state[key] === 1 ? -1 : 1;
        else newState[key] = 0;
    }
    return newState;
}

const Summary = () => {
    const files = useSelector(state => state.source.files);
    const redirect = useSelector(state => state.status.navigateToResults);
    const [colSort, setColSort] = useReducer(sortStateReducer, initialState);

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
        affectedFiles: 1
    });

    const addOccurrence = (symptomObj,fileIndex) => {
        let fileCounts;
        if (symptomObj.files.hasOwnProperty(fileIndex)) {
            fileCounts = {
                ...symptomObj.files, [fileIndex]: symptomObj.files[fileIndex] + 1
            }
            
        } else {
            fileCounts = {...symptomObj.files, [fileIndex]: 1}
        }
        return {
            totalOccurrences: symptomObj.totalOccurrences+1,
            files: fileCounts,
            affectedFiles: Object.keys(fileCounts).length
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

    const makeSummaryTable = () => {
        let symptomMap = new Map();
        for (let fileIndex in files) {
            for (let symptom of files[fileIndex].analysis.symptoms) {
                const symptomType = combinedSymptoms.hasOwnProperty(symptom.type) ? combinedSymptoms[symptom.type] : symptom.type;
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

    if (files.length === 0) {
        return <p>No source to summarise!</p>
    }
    else {
        return (
            <div className="summary-container">
                <table className="results-table">
                    <thead>
                        <tr>
                            <th onClick={() => setColSort({type: "ID"})}>Symptom ID <FontAwesomeIcon icon={faSort} /></th>
                            <th onClick={() => setColSort({type: "totalOccurrences"})}>Total Occurrences <FontAwesomeIcon icon={faSort} /></th>
                            <th onClick={() => setColSort({type: "affectedFiles"})}># of Files <FontAwesomeIcon icon={faSort} /></th>
                            <th onClick={() => setColSort({type: "affectedFiles"})}>% of Files <FontAwesomeIcon icon={faSort} /></th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            makeSummaryTable().map((symptom, index) => 
                                    <tr key={index}>
                                        <td>{symptom[0]}</td>
                                        <td>{symptom[1].totalOccurrences}</td>
                                        <td>{symptom[1].affectedFiles}</td>
                                        <td>{(symptom[1].affectedFiles / files.length * 100).toFixed(2)}</td>
                                    </tr>
                            )
                        }
                    </tbody>
                </table>
            </div>
        )
    }
}

export default Summary;