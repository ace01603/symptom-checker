import { createSlice } from "@reduxjs/toolkit";
import { symptomInfo, combinedSymptoms } from "../content/symptomInfo";

/*
fileObj.analysis.variables is []
Each entry is an {} with prop usages, an []
Each entry is a {} with prop type
*/

const createFilters = () => {
    let filters = [];
    Object.keys(symptomInfo).forEach(symptom => {
        if (combinedSymptoms.hasOwnProperty(symptom)) {
            if (!filters.includes(combinedSymptoms[symptom])) 
                filters.push(combinedSymptoms[symptom]);
        } else filters.push(symptom);
    });
    filters.sort();
    filters.push("No symptoms");
    return filters;
};

const meetsFilterCriteria = (fileObj, filters, relationship) => {
    let selectedFilters = getSelectedFilters(filters);
    if (filters["No symptoms"] === true && fileObj.analysis.symptoms.length === 0 && (relationship === "OR" || selectedFilters.length === 1)) {
        return true;
    } else if (filters["No symptoms"] === true && relationship === "AND" && selectedFilters.length > 1) {
        return false;
    }
    let symptomsInFile = fileObj.analysis.symptoms.map(symptom => combinedSymptoms.hasOwnProperty(symptom.type) ? combinedSymptoms[symptom.type] : symptom.type)
    let symptomsFound = new Set();
    for (let symptomName of symptomsInFile) {
        if (filters[symptomName]) {
            if (relationship === "OR") return true;
            symptomsFound.add(symptomName);
        }
    }
    return relationship === "AND" && symptomsFound.size === selectedFilters.length;
}

const getSelectedFilters = filters => {
    let selected = [];
    for (let f of Object.keys(filters)) {
        if (filters[f]) selected.push(f);
    }
    return selected;
}

const filterFiles = (state, filters) => {
    state.filters = filters;
    state.filteredFiles = state.files.map((file, i) => meetsFilterCriteria(file, state.filters, state.filterRelationship) ? i : -1)
                                        .filter(i => i >=0);
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

const source = createSlice({
    name: 'source',
    initialState: {
        files: [],
        filters: Object.fromEntries(createFilters().map(f => [f, true])),
        filterRelationship: "OR",
        filteredFiles: [],
        activeFile: -1, // always the filtered index
        selectedFolder: "",
    },
    reducers: {
        setFiles: (state, action) => { 
            let files = action.payload;
            files.sort(sortByFilename);
            files.forEach(f => f.analysis.symptoms.sort(sortSymptoms));
            state.files = files;
            state.filteredFiles = files.map((_, i) => i);
            state.activeFile = files.length > 0 ? 0 : -1;
            state.selectedFolder = files.length > 0 ? files[0].fileName.split("/")[0] : "";
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
            filterFiles(state, {...state.filters, [action.payload]: !state.filters[action.payload]});
        },
        setAllFilters: (state, action) => {
            filterFiles(state, Object.fromEntries(createFilters().map(f => [f, Boolean(action.payload)])));
        },
        setAllFiltersAndShowFile: (state, action) => {
            let filters = Object.fromEntries(createFilters().map(f => {
                if (f === action.payload)
                    return [f, true];
                else return [f, false];
            }))
            filterFiles(state, filters);
        },
        changeFilterRelationship: state => {
            state.filterRelationship = state.filterRelationship === "OR" ? "AND" : "OR";
            filterFiles(state, state.filters);
        }
    },
    extraReducers: {
    }
});

export default source.reducer;

// Actions
export const { setFiles, setActiveFile, showNextFile, showPrevFile, toggleFilter, setAllFilters, setAllFiltersAndShowFile, changeFilterRelationship } = source.actions;
