import { configureStore } from "@reduxjs/toolkit";
import heroReducer from "../slice/hero/heroSlice";
import counterReducer from "../slice/counter/counterSlice";

export const store = configureStore({
  reducer: {
    hero: heroReducer,
    counter: counterReducer,
  },
});

export default store;
