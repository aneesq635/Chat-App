import { createSlice } from "@reduxjs/toolkit";

const intialState = {
    theme: "dark",
    activeNav:"chats",

    contacts: [],
    conversationMessages: {},
    chats:[],
    selectedChatId: null,
    isCalling: null,
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
        setConversationHistory:(state, action)=>{
            state.conversationMessages = action.payload;
        },
        setActiveNav:(state, action)=>{
            state.activeNav = action.payload;
        },
        setChats:(state, action)=>{
            state.chats = action.payload;
        },
        setSelectedChatId:(state, action)=>{
            state.selectedChatId = action.payload;
        },
        setIsCalling:(state, action)=>{
            state.isCalling = action.payload;
        },
        addMessageToHistory:(state, action)=>{
            const { chatId, message } = action.payload;
            if (!state.conversationMessages[chatId]) {
                state.conversationMessages[chatId] = [];
            }
            state.conversationMessages[chatId].push(message);
        },
    },
});

export const { 
    setContacts, 
    setTheme, 
    setConversationHistory, 
    setActiveNav, 
    setChats, 
    setSelectedChatId, 
    setIsCalling,
    addMessageToHistory
} = mainSlice.actions;

export default mainSlice.reducer;