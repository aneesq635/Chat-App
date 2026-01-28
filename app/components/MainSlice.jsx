import { createSlice } from "@reduxjs/toolkit";

const intialState = {
  theme: "dark",
  activeNav: "chats",

  contacts: [],
  conversationMessages: {},
  chats: [],
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
    setActiveNav: (state, action) => {
      state.activeNav = action.payload;
    },
    setChats: (state, action) => {
      state.chats = action.payload;
    },
    setSelectedChatId: (state, action) => {
      state.selectedChatId = action.payload;
    },
    setIsCalling: (state, action) => {
      state.isCalling = action.payload;
    },
    setConversationMessages: (state, action) => {
      const { chatId, messages } = action.payload;
      state.conversationMessages[chatId] = messages;
    },

    // Add a single message to conversation history
    addMessageToHistory: (state, action) => {
      const { chatId, message } = action.payload;

      if (!state.conversationMessages[chatId]) {
        state.conversationMessages[chatId] = [];
      }

      // Check if message already exists (to avoid duplicates)
      const exists = state.conversationMessages[chatId].some(
        (m) => m.id === message.id,
      );

      if (!exists) {
        state.conversationMessages[chatId].push(message);
      }
    },

    // Clear conversation for a specific chat
    clearConversation: (state, action) => {
      const { chatId } = action.payload;
      delete state.conversationMessages[chatId];
    },

    updateMessageStatus: (state, action) => {
      const { chatId, tempId, messageId, status } = action.payload;
      const messages = state.conversationMessages[chatId] || [];

      const messageIndex = messages.findIndex((m) => m.id === tempId);
      if (messageIndex !== -1) {
        messages[messageIndex] = {
          ...messages[messageIndex],
          id: messageId,
          status,
        };
        state.conversationMessages[chatId] = messages;
      }
    },
  },
});

export const {
  setContacts,
  setTheme,
  setConversationMessages,
  setActiveNav,
  setChats,
  setSelectedChatId,
  setIsCalling,
  addMessageToHistory,
  clearConversation,
  updateMessageStatus,
} = mainSlice.actions;

export default mainSlice.reducer;
