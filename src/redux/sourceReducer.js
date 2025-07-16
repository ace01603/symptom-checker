import { createSlice } from "@reduxjs/toolkit";
import { sympInfo } from "../content/symptomInfo";
import { misconInfo } from "../content/misconceptionInfo";
import { parse } from "side-lib";

const MISCONCEPTIONS = "misconceptions";
const NO_MISCONCEPTIONS = "No misconceptions";
const SYMPTOMS = "symptoms";
const NO_SYMPTOMS = "No symptoms"


/*
fileObj.analysis.variables is []
Each entry is an {} with prop usages, an []
Each entry is a {} with prop type
*/

/**
 * Gets the list of symptom IDs to filter on.
 * @returns An array of strings (symptom IDs)
 */
const createSymptomFilters = () => {
    let filters = [];
    Object.keys(sympInfo).forEach(symptom => {

        filters.push(symptom);
    });
    filters.sort();
    filters.push(NO_SYMPTOMS);
    return filters;
};

const createMisconceptionFilters = () => {
    let filters = [];
    Object.keys(misconInfo).forEach(miscon => filters.push(miscon));
    filters.sort();
    filters.push(NO_MISCONCEPTIONS);
    return filters;
}
const meetsFilterCriteria = (fileObj, collection, filters, relationship, instancesInFile) => {
    let selectedFilters = getSelectedFilters(filters);
    const showNone = (collection === MISCONCEPTIONS && filters[NO_MISCONCEPTIONS] === true) || (collection === SYMPTOMS && filters[NO_SYMPTOMS] === true);
    if (showNone && fileObj.analysis[collection].length === 0
        && (relationship === "OR" || selectedFilters.length === 1)) {
        return true;
    }
    else if (showNone && relationship === "AND" && selectedFilters.length > 1) {
        return false;
    }
    let instancesFound = new Set();
    for (let instanceName of instancesInFile) {
        if (filters[instanceName]) {
            if (relationship === "OR") return true;
            instancesFound.add(instanceName);
        }
    }
    return relationship === "AND" && instancesFound.size === selectedFilters.length;
}

const getSelectedFilters = filters => {
    let selected = [];
    for (let f of Object.keys(filters)) {
        if (filters[f]) selected.push(f);
    }
    return selected;
}

const filterFiles = (state, misconFilters, symptomFilters) => {
    state.misconceptionFilters = misconFilters;
    state.symptomFilters = symptomFilters;
    state.filteredFiles = state.files.map((file, i) => {
                                const misconsInFile = file.analysis.misconceptions.map(m => m.type);
                                const symptomsInFile = file.analysis.symptoms.map(symptom => symptom.type);
                                return meetsFilterCriteria(file, MISCONCEPTIONS, misconFilters, state.misconceptionFilterRelationship, misconsInFile)
                                        && meetsFilterCriteria(file, SYMPTOMS, symptomFilters, state.symptomFilterRelationship, symptomsInFile) ? i : -1;
                            })
                            .filter(i => i >= 0);
    state.activeFile = state.filteredFiles.length > 0 ? 0 : -1;
}

const sortByFilename = (a, b) => {
    if (a.fileName < b.fileName) return -1;
    else if (a.fileName > b.fileName) return 1;
    else return 0;
}

const sortSymptoms = (a, b) => {
    if (a.docIndex < b.docIndex) return -1;
    else if (a.docIndex > b.docIndex) return 1;
    else {
        if (a.text.length > b.text.length) return -1;
        else if (a.text.length < b.text.length) return 1;
        return 0;
    }
}


export const readFiles = files => {
    return (dispatch) => {
        dispatch(setFileProcessCount(files.length));
        const tempProcessedFiles = [];

        for (const file of files) {
            const reader = new FileReader();
            reader.addEventListener("load", read => {
                const fileText = read.target.result;
                const fileName = file.webkitRelativePath === "" ? file.name : file.webkitRelativePath;
                // console.log("parsing", fileName);
                const analysis = parse(fileText, {showCounterSymptoms: true, showConcepts: true});
                tempProcessedFiles.push({
                    fileName,
                    text:fileText,
                    analysis: {
                        symptoms: analysis.symptoms,
                        misconceptions: analysis.misconceptions,
                        counterSymptoms: analysis.counterSymptoms,
                        concepts: analysis.concepts
                    }
                });
                const remainingFiles = files.length - tempProcessedFiles.length;
                dispatch(setFileProcessCount(remainingFiles));
                if (remainingFiles === 0) {
                    dispatch(setFiles(tempProcessedFiles));
                }
            });
            reader.readAsText(file);
        }
    }
};

const source = createSlice({
    name: 'source',
    initialState: {
        files: [],
        symptomFilters: Object.fromEntries(createSymptomFilters().map(f => [f, true])),
        symptomFilterRelationship: "OR",
        misconceptionFilters: Object.fromEntries(createMisconceptionFilters().map(f => [f, true])),
        misconceptionFilterRelationship: "OR",
        filteredFiles: [],
        activeFile: -1, // always the filtered index
        selectedFolder: "",
        filesToProcessCount: 0
    },
    reducers: {
        setFiles: (state, action) => { 
            let files = action.payload;
            files.sort(sortByFilename);
            files.forEach(f => {
                f.analysis.symptoms.sort(sortSymptoms)
            });
            state.files = files;
            state.filteredFiles = files.map((_, i) => i);
            state.activeFile = files.length > 0 ? 0 : -1;
            state.selectedFolder = files.length > 0 ? files[0].fileName.split("/")[0] : "";
            state.filesToProcessCount = 0;
        },
        setFileProcessCount: (state, action) => {
            state.filesToProcessCount = action.payload;
        },
        setActiveFile: (state, action) => {
            state.activeFile = action.payload >=0 && action.payload < state.filteredFiles.length ? Number(action.payload) : -1;
        },
        showNextFile: state => {
            if (state.filteredFiles.length > 0) {
                state.activeFile = state.activeFile < state.filteredFiles.length - 1 ? state.activeFile + 1 : 0;
            }
        },
        showPrevFile: state => {
            if (state.filteredFiles.length > 0) {
                state.activeFile = state.activeFile > 0 ? state.activeFile - 1 : state.filteredFiles.length - 1;
            }
        },
        toggleFilter: (state, action) => {
            if (action.payload.table === SYMPTOMS)
                filterFiles(state, state.misconceptionFilters, {...state.symptomFilters, [action.payload.selected]: !state.symptomFilters[action.payload.selected]});
            else if (action.payload.table === MISCONCEPTIONS)
                filterFiles(state, {...state.misconceptionFilters, [action.payload.selected]: !state.misconceptionFilters[action.payload.selected]}, state.symptomFilters);
        },
        setAllFilters: (state, action) => {
            if (action.payload.filterBy === SYMPTOMS)
                filterFiles(state, 
                            state.misconceptionFilters,
                            Object.fromEntries(createSymptomFilters().map(f => [f, Boolean(action.payload.setTo)])));
            else if (action.payload.filterBy === MISCONCEPTIONS)
                filterFiles(state, 
                            Object.fromEntries(createMisconceptionFilters().map(f => [f, Boolean(action.payload.setTo)])),
                            state.symptomFilters);
        },
        setAllFiltersAndShowFile: (state, action) => {
            let filterListFunc = action.payload.table === MISCONCEPTIONS ? createMisconceptionFilters : createSymptomFilters;
            let filters = Object.fromEntries(filterListFunc().map(f => {
                if (f === action.payload.selected)
                    return [f, true];
                else return [f, false];
            }))
            if (action.payload.table === MISCONCEPTIONS)
                filterFiles(state, filters, Object.fromEntries(createSymptomFilters().map(f => [f, true])));
            else if (action.payload.table === SYMPTOMS)
                filterFiles(state, Object.fromEntries(createMisconceptionFilters().map(f => [f, true])), filters);
        },
        // UPDATE TO TAKE COLLECTION / ADD ANOTHER ACTION
        changeFilterRelationship: (state, action) => {
            if (action.payload === MISCONCEPTIONS)
                state.misconceptionFilterRelationship = state.misconceptionFilterRelationship === "OR" ? "AND" : "OR";
            else if (action.payload === SYMPTOMS)
                state.symptomFilterRelationship = state.symptomFilterRelationship === "OR" ? "AND" : "OR";
            filterFiles(state, state.misconceptionFilters, state.symptomFilters);
        }
    }
});

export default source.reducer;

// Actions
export const { setFiles, setFileProcessCount, setActiveFile, showNextFile, showPrevFile, toggleFilter, setAllFilters, setAllFiltersAndShowFile, changeFilterRelationship } = source.actions;
