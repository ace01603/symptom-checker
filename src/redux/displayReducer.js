import { createSlice } from "@reduxjs/toolkit";
import { setAllFiltersAndShowFile } from "./sourceReducer";

const NONE = "none";

const display = createSlice({
    name: "display",
    initialState: {
        showMisconceptions: true, // toggle misconceptions vs concepts
        showUnmatchedSymptoms: false,
        selectedConcept: NONE
    },
    reducers: {
        toggleMisconceptions: (state, action) => {
            state.showMisconceptions = action.payload
        },
        updateUnmatchedDisplaySetting: (state, action) => {
            state.showUnmatchedSymptoms = action.payload;
        },
        updateSelectedConcept: (state, action) => {
            console.log(action.payload);
            state.selectedConcept = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(setAllFiltersAndShowFile, (state, action) => {
                if (action.payload.table === "concepts") {
                    state.showMisconceptions = false;
                    state.selectedConcept = action.payload.selected;
                }
            });
    }
});

export default display.reducer;

export const { toggleMisconceptions, updateUnmatchedDisplaySetting, updateSelectedConcept } = display.actions;