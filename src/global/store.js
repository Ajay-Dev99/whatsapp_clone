import { configureStore } from "@reduxjs/toolkit";
import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import userReducer from "./features/userSlice";
import roomReducer from "./features/roomSlice";

const userPersistConfig = {
  key: "user",
  storage,
  whitelist: ["user", "selectedChat"],
};

const roomPersistConfig = {
  key: "room",
  storage,
  whitelist: ["room"],
};

const persistedUserReducer = persistReducer(userPersistConfig, userReducer);
const persistedRoomReducer = persistReducer(roomPersistConfig, roomReducer);

export const store = configureStore({
  reducer: {
    user: persistedUserReducer,
    room: persistedRoomReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export default store;