import { createSlice } from "@reduxjs/toolkit";

const intialState = {
    contacts: [],
    theme: "dark",
};

export const mainSlice = createSlice({
    name: "main",
    initialState: intialState,
    reducers: {
        setContacts: (state, action) => {
            state.contacts = action.payload;
        },
        setTheme: (state, action) => {
            state.theme = action.payload;
        },
    },
});

export const { setContacts, setTheme } = mainSlice.actions;

export default mainSlice.reducer;