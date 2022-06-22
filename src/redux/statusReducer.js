import { createSlice } from "@reduxjs/toolkit";

const status = createSlice({
    name: "status",
    initialState: {
        navigateToResults: false,
        navigateToFileView: false,
        summarySort: {
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
            if (!state.summarySort.hasOwnProperty(action.payload)) throw new Error(`Couldn't sort by ${action.payload}`);
            let newSort = {};
            for (let key of Object.keys(state.summarySort)) {
                if (key === action.payload) newSort[key] = state.summarySort[key] === 0 ? -1 : state.summarySort[key] * -1;
                else newSort[key] = 0;
            }
            state.summarySort = newSort;
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
            console.log("b");
            state.navigateToFileView = true;
        }
    }
});

export default status.reducer;

export const { disableRedirect, summarySortBy, disableFileViewRedirect } = status.actions;