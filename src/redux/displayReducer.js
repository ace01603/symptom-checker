import { createSlice } from "@reduxjs/toolkit";

const display = createSlice({
    name: "display",
    initialState: {
        showMisconceptions: true,
        showConcepts: true,
        showUnmatchedSymptoms: false
    },
    reducers: {
        updateDisplaySetting: (state, action) => {
            state[action.payload.setting] = action.payload.value;
        }
    }
});

export default display.reducer;

export const { updateDisplaySetting } = display.actions;