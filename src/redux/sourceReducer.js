import { createSlice } from "@reduxjs/toolkit";

const source = createSlice({
    name: 'source',
    initialState: {
        files: [],
        activeFile: -1
    },
    reducers: {
        setFiles: (state, action) => { 
            state.files = action.payload;
            state.activeFile = action.payload.length > 0 ? 0 : -1;
        },
        setActiveFile: (state, action) => {
            state.activeFile = action.payload >=0 && action.payload < state.files.length ? action.payload : -1;
        },
        showNextFile: state => {
            if (state.files.length > 0) {
                state.activeFile = state.activeFile < state.files.length - 1 ? state.activeFile++ : 0;
            }
        },
        showPrevFile: state => {
            if (state.files.length > 0) {
                state.activeFile = state.activeFile > 0 ? state.activeFile-- : state.files.length - 1;
            }
        }
    },
    extraReducers: {
    }
});

export default source.reducer;

// Actions
export const { setFiles, setActiveFile, showNextFile, showPrevFile } = source.actions;
