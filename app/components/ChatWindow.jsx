import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CONSTANTS } from "./constant";
import { addMessageToHistory, setConversationMessages } from "./MainSlice";
const { Icons } = CONSTANTS;
import { Avatar } from "./Utilities";
// import { useSocket } from "../lib/hook/useSocket";
import { useAuth } from "./AuthContext";

function ChatWindow({ chat, selectedChatId, onStartCall }) {
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef(null);
  const dispatch = useDispatch();
  
  const conversationMessages = useSelector(
    (state) => state.main.conversationMessages
  );
  
  const chatMessages = conversationMessages[selectedChatId] || [];
  
  // Get current user from Redux or context (you need to pass this)
  // For now, assuming chat.userId is the CURRENT user
  const {user} = useAuth()
  const currentUserId = user?.id;
  
  const socket = useSocket(currentUserId);
  
  console.log("=== ChatWindow Debug ===");
  console.log("Current User ID:", currentUserId);
  console.log("Other User (chat.userId):", chat.userId);
  console.log("Other User (chat.id):", chat.id);
  console.log("Selected Chat ID:", selectedChatId);
  console.log("Socket status:", socket ? "✅ Connected" : "❌ Not connected");

  // Fetch conversation history
  useEffect(() => {
    if (!selectedChatId) return;
    
    const fetchConversationHistory = async () => {
      setIsLoading(true);
      try {
        console.log("📥 Fetching conversation history for:", selectedChatId);
        const res = await fetch(`/api/conversation/${selectedChatId}`);
        const data = await res.json();
        
        console.log("📦 Received data:", data);
        
        if (data.success && data.messages) {
          // Format messages: compare senderId with CURRENT user
          const formattedMessages = data.messages.map(m => {
            const isMyMessage = m.senderId === currentUserId;
            console.log(`Message from ${m.senderId}: ${isMyMessage ? 'ME' : 'OTHER'}`);
            
            return {
              ...m,
              sender: isMyMessage ? "user" : "bot"
            };
          });
          
          dispatch(setConversationMessages({ 
            chatId: selectedChatId, 
            messages: formattedMessages 
          }));
        }
      } catch (error) {
        console.error("❌ Error fetching conversation history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversationHistory();
  }, [selectedChatId, dispatch, currentUserId]);

  // Socket listeners
  useEffect(() => {
    if (!socket) {
      console.log("❌ Socket not initialized");
      return;
    }
    
    if (!selectedChatId) {
      console.log("❌ No chat selected");
      return;
    }

    console.log("✅ Joining chat:", selectedChatId);
    socket.emit("join-chat", selectedChatId);

    // Listen for new messages
    const handleNewMessage = (message) => {
      console.log("📩 NEW MESSAGE RECEIVED:");
      console.log("  - Message ID:", message.id);
      console.log("  - Sender ID:", message.senderId);
      console.log("  - Current User ID:", currentUserId);
      console.log("  - Text:", message.text);
      
      const isMyMessage = message.senderId === currentUserId;
      
      const formattedMessage = {
        id: message.id,
        chatId: message.chatId,
        text: message.text,
        sender: isMyMessage ? "user" : "bot",
        timestamp: message.timestamp,
        status: message.status || "delivered",
      };

      // Only add if message is NOT from current user (to avoid duplicates)
      if (!isMyMessage) {
        console.log("✅ Adding OTHER user's message to history");
        dispatch(addMessageToHistory({ 
          chatId: selectedChatId, 
          message: formattedMessage 
        }));
      } else {
        console.log("⚠️ Skipping own message (already added optimistically)");
      }
    };

    const handleTyping = ({ userId, isTyping: typing }) => {
      console.log("⌨️ Typing event:", { userId, typing });
      // Only show typing if it's from the OTHER user
      if (userId !== currentUserId) {
        setIsTyping(typing);
      }
    };

    socket.on("new-message", handleNewMessage);
    socket.on("user-typing", handleTyping);

    return () => {
      console.log("👋 Leaving chat:", selectedChatId);
      socket.emit("leave-chat", selectedChatId);
      socket.off("new-message", handleNewMessage);
      socket.off("user-typing", handleTyping);
    };
  }, [socket, selectedChatId, currentUserId, dispatch]);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages, isTyping]);

  // Handle typing indicator
  const handleInputChange = (e) => {
    setInputText(e.target.value);
    
    if (socket && selectedChatId) {
      socket.emit("typing", {
        chatId: selectedChatId,
        userId: currentUserId,
        isTyping: e.target.value.length > 0
      });
    }
  };

  // Send message function
  const sendMessage = useCallback(
    async (text) => {
      console.log("=== SENDING MESSAGE ===");
      console.log("Chat ID:", selectedChatId);
      console.log("Text:", text);
      console.log("Socket:", socket ? "✅" : "❌");
      
      if (!selectedChatId || !text.trim() || !socket || !currentUserId) {
        console.log("❌ Cannot send - missing required data");
        return;
      }

      const tempId = `temp-${Date.now()}`;
      
      const optimisticMessage = {
        id: tempId,
        chatId: selectedChatId,
        text,
        sender: "user",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: "sending",
      };

      // Add optimistic message immediately
      dispatch(addMessageToHistory({ 
        chatId: selectedChatId, 
        message: optimisticMessage 
      }));

      // Prepare message data
      // chat.userId is the OTHER user's ID (the person you're chatting with)
      const messageData = {
        chatId: selectedChatId,
        senderId: currentUserId,        // YOUR user ID
        receiverId: chat.userId,        // OTHER user's ID
        text,
        tempId
      };

      console.log("📤 Emitting message:", messageData);
      
      // Send via socket
      socket.emit("send-message", messageData);
      
      // Stop typing indicator
      socket.emit("typing", {
        chatId: selectedChatId,
        userId: currentUserId,
        isTyping: false
      });
    },
    [selectedChatId, socket, chat.userId, currentUserId, dispatch]
  );

  const handleSend = () => {
    if (inputText.trim()) {
      sendMessage(inputText);
      setInputText("");
    }
  };

  return (
    <div className="h-full flex flex-col">
      <header className="h-20 bg-white border-b border-slate-200 px-6 flex items-center justify-between flex-shrink-0 z-10">
        <div className="flex items-center gap-4">
          <Avatar
            src={chat.avatar}
            status={isTyping ? "typing" : chat.status}
          />
          <div className="min-w-0">
            <h2 className="font-bold text-slate-900 truncate">{chat.name}</h2>
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              {isTyping ? (
                "Typing..."
              ) : chat.status === "online" ? (
                <>
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Online
                </>
              ) : (
                "Offline"
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onStartCall("voice")}
            className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors text-slate-600"
          >
            <Icons.Calls className="w-6 h-6" />
          </button>
          <button
            onClick={() => onStartCall("video")}
            className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors text-slate-600"
          >
            <Icons.VideoCall className="w-6 h-6" />
          </button>
          <button className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors text-slate-600">
            <Icons.More className="w-6 h-6" />
          </button>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="flex justify-center mb-8">
          <span className="px-3 py-1 bg-white shadow-sm border border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400 rounded-full">
            Today
          </span>
        </div>

        {isLoading ? (
          <div className="text-center text-slate-400 text-sm py-10">
            Loading messages...
          </div>
        ) : chatMessages.length === 0 ? (
          <div className="text-center text-slate-400 text-sm italic py-10">
            No messages yet. Say hi! 👋
          </div>
        ) : (
          chatMessages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                  m.sender === "user"
                    ? "bg-indigo-600 text-white rounded-tr-none"
                    : "bg-white text-slate-800 rounded-tl-none border border-slate-100"
                }`}
              >
                <p className="leading-relaxed">{m.text}</p>
                <div
                  className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${
                    m.sender === "user" ? "text-indigo-200" : "text-slate-400"
                  }`}
                >
                  {m.timestamp}
                  {m.sender === "user" && (
                    <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-slate-100 flex gap-1">
              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-white border-t border-slate-200 flex-shrink-0">
        <div className="flex items-center gap-3 bg-slate-100 p-2 rounded-2xl transition-all focus-within:ring-2 focus-within:ring-indigo-100 focus-within:bg-white border focus-within:border-indigo-500">
          <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
            <Icons.Attachment className="w-6 h-6" />
          </button>
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-slate-900 py-1"
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className={`p-2.5 rounded-xl transition-all ${
              inputText.trim()
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            <Icons.Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatWindow;