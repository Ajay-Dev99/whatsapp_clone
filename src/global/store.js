import { configureStore } from '@reduxjs/toolkit';
import userReducer from './features/userSlice';
import { getAuthUser, isTokenValid } from '../utils/authStorage';

const buildPreloadedState = () => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  if (!isTokenValid()) {
    return undefined;
  }

  const storedUser = getAuthUser();

  if (!storedUser) {
    return undefined;
  }

  return {
    user: {
      user: storedUser,
      activeUser: null,
    },
  };
};

const store = configureStore({
  reducer: {
    user: userReducer,
  },
  preloadedState: buildPreloadedState(),
});

export default store;