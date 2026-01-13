import React, { useState, useEffect, useRef } from 'react';
import { CONSTANTS } from './constant';
const { Icons } = CONSTANTS;
import { Avatar } from "./Utilities";

// ChatWindow Component
function ChatWindow({ chat, messages, onSendMessage, isTyping, onStartCall }) {
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  return (
    <div className="h-full flex flex-col">
      <header className="h-20 bg-white border-b border-slate-200 px-6 flex items-center justify-between flex-shrink-0 z-10">
        <div className="flex items-center gap-4">
          <Avatar src={chat.avatar} status={chat.status === 'typing' || isTyping ? 'typing' : chat.status} />
          <div className="min-w-0">
            <h2 className="font-bold text-slate-900 truncate">{chat.name}</h2>
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              {isTyping ? 'Typing...' : chat.status === 'online' ? <><span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online</> : 'Offline'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onStartCall('voice')} className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors text-slate-600"><Icons.Calls className="w-6 h-6" /></button>
          <button onClick={() => onStartCall('video')} className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors text-slate-600"><Icons.VideoCall className="w-6 h-6" /></button>
          <button className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors text-slate-600"><Icons.More className="w-6 h-6" /></button>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="flex justify-center mb-8">
           <span className="px-3 py-1 bg-white shadow-sm border border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400 rounded-full">Today</span>
        </div>
        
        {messages.length === 0 && (
          <div className="text-center text-slate-400 text-sm italic py-10">No messages yet. Say hi! 👋</div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${m.sender === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'}`}>
              <p className="leading-relaxed">{m.text}</p>
              <div className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${m.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'}`}>
                {m.timestamp}
                {m.sender === 'user' && (
                   <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current">
                     <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                   </svg>
                )}
              </div>
            </div>
          </div>
        ))}
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
          <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Icons.Attachment className="w-6 h-6" /></button>
          <input 
            type="text" 
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-slate-900 py-1"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={!inputText.trim()}
            className={`p-2.5 rounded-xl transition-all ${inputText.trim() ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
          >
            <Icons.Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
export default ChatWindow;