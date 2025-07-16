import { configureStore } from "@reduxjs/toolkit";
import sourceReducer from "./sourceReducer";
import statusReducer from "./statusReducer";

const store = configureStore({
    reducer: {
      source: sourceReducer,
      status: statusReducer,
    },
    middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['source/readFiles']
      },
    }),
});
  
export default store