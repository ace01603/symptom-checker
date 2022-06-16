import { configureStore } from "@reduxjs/toolkit";
import sourceReducer from "./sourceReducer";
import statusReducer from "./statusReducer";

const store = configureStore({
    reducer: {
      source: sourceReducer,
      status: statusReducer,
    },
});
  
export default store