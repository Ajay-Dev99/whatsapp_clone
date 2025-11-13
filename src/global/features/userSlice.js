import { createSlice } from '@reduxjs/toolkit';

export const userSlice = createSlice({
    name: 'user',
    initialState: {
        user: null,
        selectedChat: null,
    },
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
        },
        setSelectedChat: (state, action) => {
            state.selectedChat = action.payload;
        },
    },
});

export const { setUser, setSelectedChat } = userSlice.actions;
export default userSlice.reducer;