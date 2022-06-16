import { createSlice } from "@reduxjs/toolkit";

const status = createSlice({
    name: "status",
    initialState: {
        sourceLoading: false,
        activeTab: 0,
    },
    reducers: {
    },
    extraReducers: {
        "source/filesSelected": state => {
            state.sourceLoading = true;
        }
    }
});

export default status.reducer;

export const { startLoad } = status.actions;