import { configureStore } from "@reduxjs/toolkit";
import itemSlice from "./item-slice";

const store = configureStore({
  reducer: {
    item: itemSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
export type RootState = ReturnType<typeof store.getState>;

export default store;
