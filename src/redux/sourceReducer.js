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

const meetsFilterCriteria = (fileObj, filters) => {
    if (filters["No symptoms"] && fileObj.analysis.symptoms.length === 0) {
        return true;
    } else {
        for (let symptom of fileObj.analysis.symptoms) {
            let symptomName = combinedSymptoms.hasOwnProperty(symptom.type) ? combinedSymptoms[symptom.type] : symptom.type;
            if (filters[symptomName]) return true;
        }
    }
    return false;
}

const source = createSlice({
    name: 'source',
    initialState: {
        files: [],
        filters: Object.fromEntries(createFilters().map(f => [f, true])),
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
            state.filters = {...state.filters, [action.payload]: !state.filters[action.payload]};
            state.filteredFiles = state.files.map((file, i) => meetsFilterCriteria(file, state.filters) ? i : -1)
                                             .filter(i => i >=0);
            state.activeFile = state.filteredFiles.length > 0 ? 0 : -1;
        }
    },
    extraReducers: {
    }
});

export default source.reducer;

// Actions
export const { setFiles, setActiveFile, showNextFile, showPrevFile, toggleFilter } = source.actions;
