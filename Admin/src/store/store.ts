import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import settingsReducer from "./slices/settingsSlice";
import toolsAdminReducer from "./slices/toolsAdminSlice";

export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      toolsAdmin: toolsAdminReducer,
      settings: settingsReducer,
    },
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
