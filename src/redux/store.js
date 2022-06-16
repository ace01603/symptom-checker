import { configureStore } from "@reduxjs/toolkit";
import sourceReducer from "./sourceReducer";

const store = configureStore({
    reducer: {
      source: sourceReducer
    },
});
  
export default store