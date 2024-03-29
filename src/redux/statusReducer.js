import { createSlice } from "@reduxjs/toolkit";

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
        }
    },
    reducers: {
        disableRedirect: state => {
            state.navigateToResults = false;
        },
        summarySortBy: (state, action) => {
            const sortProp = action.payload.table === "misconceptions" ? "summarySortMisconceptions" : "summarySortSymptoms";
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
    extraReducers: {
        "source/setFiles": state => {
            state.navigateToResults = true;
        },
        "source/setAllFiltersAndShowFile": state => {
            state.navigateToFileView = true;
        }
    }
});

export default status.reducer;

export const { disableRedirect, summarySortBy, disableFileViewRedirect } = status.actions;