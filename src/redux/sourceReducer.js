import { createSlice } from "@reduxjs/toolkit";
import { symptomInfo, combinedSymptoms } from "../content/symptomInfo";

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
    if (filters["No symptoms"] && fileObj.analysis.symptoms.length === 0 && (relationship === "OR" || selectedFilters.length === 1)) {
        return true;
    } else if (filters["No symptoms"] && relationship === "AND" && selectedFilters.length > 1) {
        return false;
    }
    else {
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
            state.files = action.payload;
            state.filteredFiles = action.payload.map((_, i) => i);
            state.activeFile = action.payload.length > 0 ? 0 : -1;
            state.selectedFolder = action.payload.length > 0 ? action.payload[0].fileName.split("/")[0] : "";
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
            console.log("a", state.filterRelationship);
            state.filterRelationship = state.filterRelationship === "OR" ? "AND" : "OR";
            console.log("b", state.filterRelationship);
            filterFiles(state, state.filters);
        }
    },
    extraReducers: {
    }
});

export default source.reducer;

// Actions
export const { setFiles, setActiveFile, showNextFile, showPrevFile, toggleFilter, setAllFilters, setAllFiltersAndShowFile, changeFilterRelationship } = source.actions;
