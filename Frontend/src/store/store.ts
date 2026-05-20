import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "./slices/uiSlice";
import toolsReducer from "./slices/toolsSlice";

export const makeStore = () =>
  configureStore({
    reducer: {
      ui: uiReducer,
      tools: toolsReducer,
    },
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
