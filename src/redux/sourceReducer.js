import { createSlice } from "@reduxjs/toolkit";
import { parse } from "side-lib";

const source = createSlice({
    name: 'source',
    initialState: {
        files: [],
        activeFile: -1
    },
    reducers: {
        setSourceFiles: (state, action) => {
            let files = action.payload;
            for (let file of files) {
                file.analysis = parse(file.text);
            }
            state.files = files;
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
});

export default source.reducer;

// Actions
export const { setSourceFiles, setActiveFile, showNextFile, showPrevFile } = source.actions;
