import { createSlice } from '@reduxjs/toolkit';

export const userSlice = createSlice({
    name: 'user',
    initialState: {
        user: null,
        activeUser: null,
    },
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
        },
        setActiveUser: (state, action) => {
            state.activeUser = action.payload;
        },
    },
});

export const { setUser } = userSlice.actions;
export default userSlice.reducer;