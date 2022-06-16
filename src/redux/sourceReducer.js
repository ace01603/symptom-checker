import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { parse } from "side-lib";

const processFilesAsync = async files => {
    for (let file of files) {
        file.analysis = parse(file.text);
    }
    return files;
}

export const loadSourceFilesAsync = createAsyncThunk(
    'source/loadSourceAsync',
    async (files, thunkAPI) => {
        const updatedFiles = await processFilesAsync(files);
        return updatedFiles
    }
);

const source = createSlice({
    name: 'source',
    initialState: {
        files: [],
        activeFile: -1,
        sourceLoading: false
    },
    reducers: {
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
        [loadSourceFilesAsync.pending]: (state) => {
            state.sourceLoading = true;
            state.files = [];
            state.activeFile = -1;
        },
        [loadSourceFilesAsync.fulfilled]: (state, { payload }) => {
            state.sourceLoading = false;
            state.files = payload;
            state.activeFile = payload.length > 0 ? 0 : -1;
        },
        [loadSourceFilesAsync.rejected]: (state) => {
            state.sourceLoading = false
        },
    }
});

export default source.reducer;

// Actions
export const { setActiveFile, showNextFile, showPrevFile } = source.actions;
