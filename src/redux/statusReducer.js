import { createSlice } from "@reduxjs/toolkit";

const status = createSlice({
    name: "status",
    initialState: {
        navigateToResults: false
    },
    reducers: {
        disableRedirect: state => {
            state.navigateToResults = false;
        }
    },
    extraReducers: {
        "source/setFiles": state => {
            state.navigateToResults = true;
        }
    }
});

export default status.reducer;

export const { disableRedirect } = status.actions;