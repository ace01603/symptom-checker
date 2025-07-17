import { createSlice } from "@reduxjs/toolkit";
import { setAllFiltersAndShowFile, setFiles } from "./sourceReducer";

const status = createSlice({
    name: "status",
    initialState: {
        navigateToResults: false,
        navigateToFileView: false,
        summarySortSymptoms: {
            ID: 0,
            totalOccurrences: -1,
            affectedFiles: 0
        },
        summarySortMisconceptions: {
            ID: 0,
            affectedFiles: -1
        },
        summarySortConcepts: {
            ID: 0,
            totalOccurrences: -1,
            affectedFiles: 0
        }
    },
    reducers: {
        disableRedirect: state => {
            state.navigateToResults = false;
        },
        summarySortBy: (state, action) => {
            const sortProp = action.payload.table === "misconceptions" ? "summarySortMisconceptions" : 
                                action.payload.table === "symptoms" ? "summarySortSymptoms" : "summarySortConcepts";
            let newSort = {};
            for (let key of Object.keys(state[sortProp])) {
                if (key === action.payload.column) newSort[key] = state[sortProp][key] === 0 ? -1 : state[sortProp][key] * -1;
                else newSort[key] = 0;
            }
            state[sortProp] = newSort;
        },
        disableFileViewRedirect: state => {
            state.navigateToFileView = false;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(setFiles, state => {
                state.navigateToResults = true;
            })
            .addCase(setAllFiltersAndShowFile, state => {
                state.navigateToFileView = true;
            });
    }
});

export default status.reducer;

export const { disableRedirect, summarySortBy, disableFileViewRedirect } = status.actions;