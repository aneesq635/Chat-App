"use client";
import React, { useState, useEffect, useRef, useCallback, use } from 'react';
import { useAuth } from '../components/AuthContext';
import { CONSTANTS } from '../components/constant';
const { Icons, INITIAL_CHATS, INITIAL_CALLS, INITIAL_CONTACTS } = CONSTANTS;
import ProfileScreen from '../components/ProfileScreen';

const Avatar = ({ src, size = 'md', status }) => {
  const sizeClass = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-14 h-14' : 'w-12 h-12';
  return (
    <div className={`relative ${sizeClass} rounded-full flex-shrink-0 bg-slate-200`}>
      <img src={src} alt="avatar" className="w-full h-full rounded-full object-cover" />
      {status === 'online' && (
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
      )}
      {status === 'typing' && (
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-indigo-500 border-2 border-white rounded-full animate-pulse"></div>
      )}
    </div>
  );
};

// NavButton Component
function NavButton({ active, onClick, icon, label }) {
  return (
    <button 
      onClick={onClick}
      className={`group relative flex items-center justify-center p-3 rounded-xl transition-all ${active ? 'bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
    >
      {icon}
      <div className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
        {label}
      </div>
    </button>
  );
}

// CenterPanelContent Component
function CenterPanelContent({ activeNav, chats, selectedChatId, onSelectChat }) {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredChats = chats.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (filter === 'unread') return matchesSearch && c.unreadCount > 0;
    return matchesSearch;
  });

  return (
    <>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-6 capitalize">{activeNav}</h1>
        
        <div className="relative mb-6">
          <Icons.Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder={activeNav === 'search' ? "Search by User ID..." : "Search..."}
            className="w-full pl-10 pr-4 py-3 bg-slate-100 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl transition-all outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {activeNav === 'chats' && (
          <div className="flex gap-2 mb-4">
            {['all', 'unread', 'favorites'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filter === f ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        {activeNav === 'chats' && filteredChats.map(chat => (
          <button 
            key={chat.id} 
            onClick={() => onSelectChat(chat.id)}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl mb-1 transition-all ${selectedChatId === chat.id ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-slate-50'}`}
          >
            <Avatar src={chat.avatar} status={chat.status} />
            <div className="flex-1 min-w-0 text-left">
              <div className="flex justify-between items-baseline">
                <h3 className={`font-semibold text-slate-900 truncate ${chat.unreadCount > 0 ? 'font-bold' : ''}`}>{chat.name}</h3>
                <span className="text-xs text-slate-400">{chat.timestamp}</span>
              </div>
              <p className="text-sm text-slate-500 truncate mt-0.5">{chat.lastMessage}</p>
            </div>
            {chat.unreadCount > 0 && (
              <div className="w-5 h-5 bg-indigo-600 text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                {chat.unreadCount}
              </div>
            )}
          </button>
        ))}

        {activeNav === 'calls' && INITIAL_CALLS.map(call => (
          <div key={call.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all group">
            <Avatar src={call.avatar} />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 truncate">{call.name}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                {call.status === 'missed' ? <Icons.Calls className="w-3 h-3 text-red-500" /> : <Icons.Calls className="w-3 h-3 text-green-500 rotate-180" />}
                <span className="text-xs text-slate-500 truncate">{call.timestamp}</span>
              </div>
            </div>
            <button className="p-2 text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-50 rounded-full">
              {call.type === 'video' ? <Icons.VideoCall className="w-5 h-5" /> : <Icons.Calls className="w-5 h-5" />}
            </button>
          </div>
        ))}

        {activeNav === 'contacts' && INITIAL_CONTACTS.map(contact => (
          <div key={contact.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all">
            <Avatar src={contact.avatar} />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 truncate">{contact.name}</h3>
              <p className="text-xs text-indigo-600 font-medium truncate">@{contact.userId}</p>
              <p className="text-sm text-slate-500 truncate mt-0.5">{contact.statusText}</p>
            </div>
          </div>
        ))}

        {activeNav === 'search' && searchTerm && (
          <div className="px-4 py-2">
             <p className="text-sm text-slate-500 mb-4">Searching results for "{searchTerm}"</p>
             <div className="flex flex-col gap-4">
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-center">
                  <p className="text-sm text-slate-600 font-medium">No direct user matches found for this ID.</p>
                  <button className="mt-3 px-4 py-2 bg-indigo-600 text-white text-sm rounded-xl hover:bg-indigo-700 transition-colors">Invite by Email</button>
                </div>
             </div>
          </div>
        )}
      </div>
    </>
  );
}

// EmptyState Component
function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto">
      <div className="w-24 h-24 bg-white rounded-3xl shadow-sm border border-slate-200 flex items-center justify-center mb-8">
        <Icons.Chats className="w-12 h-12 text-indigo-600" />
      </div>
      <h2 className="text-3xl font-bold text-slate-900 mb-3">Welcome to NexTalk</h2>
      <p className="text-slate-500 leading-relaxed mb-8">
        Select a chat to start messaging or search users using their Unique ID. Your conversations are secured with end-to-end encryption.
      </p>
      <div className="flex gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-400 border border-slate-200 px-3 py-1.5 rounded-full">
          <Icons.Calls className="w-3 h-3" /> Voice Calls
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 border border-slate-200 px-3 py-1.5 rounded-full">
          <Icons.VideoCall className="w-3 h-3" /> Video 4K
        </div>
      </div>
    </div>
  );
}

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

function CallScreen({ type, onClose, contactName, avatar }) {
  return (
    <div className="absolute inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <div className="relative mb-8">
          <Avatar src={avatar} size="lg" />
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/30 animate-ping"></div>
        </div>

        <h2 className="text-3xl font-bold text-white mb-2">
          {contactName}
        </h2>

        <p className="text-slate-400 uppercase tracking-widest text-sm font-semibold">
          {type === "video" ? "Video Calling..." : "Voice Calling..."}
        </p>
      </div>

      <div className="w-full max-w-lg mb-20 px-6">
        <div className="bg-slate-800/50 backdrop-blur-xl p-8 rounded-[40px] flex justify-center items-center gap-8 shadow-2xl border border-white/5">

          <button className="w-14 h-14 bg-slate-700/50 text-white rounded-full flex items-center justify-center hover:bg-slate-600 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          </button>

          <button className="w-14 h-14 bg-slate-700/50 text-white rounded-full flex items-center justify-center hover:bg-slate-600 transition-colors">
            <Icons.VideoCall className="w-6 h-6" />
          </button>

          <button
            onClick={onClose}
            className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all hover:scale-105"
          >
            <svg className="w-8 h-8 rotate-[135deg]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
            </svg>
          </button>

          <button className="w-14 h-14 bg-slate-700/50 text-white rounded-full flex items-center justify-center hover:bg-slate-600 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
            </svg>
          </button>

          <button className="w-14 h-14 bg-slate-700/50 text-white rounded-full flex items-center justify-center hover:bg-slate-600 transition-colors">
            <Icons.More className="w-6 h-6" />
          </button>

        </div>
      </div>
    </div>
  );
}


const mainapp = () => {
  const [activeNav, setActiveNav] = useState('chats');
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [messages, setMessages] = useState({});
  const [chats, setChats] = useState(INITIAL_CHATS);
  const [isCalling, setIsCalling] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const {user} = useAuth();
  const [profilePage , setProfilePage] = useState(false);
  console.log("profile page state" , profilePage);  
  const avatar_url = user?.user_metadata?.avatar_url ;

  const activeChat = chats.find(c => c.id === selectedChatId);

  const sendMessage = useCallback(async (text) => {
    if (!selectedChatId || !text.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      chatId: selectedChatId,
      text,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };

    setMessages(prev => ({
      ...prev,
      [selectedChatId]: [...(prev[selectedChatId] || []), newMessage]
    }));

    setChats(prev => prev.map(c => c.id === selectedChatId ? { ...c, lastMessage: text, timestamp: 'Just now' } : c));

    if (selectedChatId === '1') {
      setIsTyping(true);
      const history = (messages['1'] || []).map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));
      
      const aiText = await getGeminiResponse(text, history);
      
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        chatId: selectedChatId,
        text: aiText || '...',
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'delivered'
      };

      setMessages(prev => ({
        ...prev,
        [selectedChatId]: [...(prev[selectedChatId] || []), aiMessage]
      }));
      setIsTyping(false);
    }
  }, [selectedChatId, messages]);

  const setFunction = ()=>{
    setProfilePage(true);
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      <nav className="w-16 md:w-20 bg-white border-r border-slate-200 flex flex-col items-center py-6 flex-shrink-0 z-50">
        <div className="mb-8 p-2 bg-indigo-600 rounded-xl text-white">
          <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current">
            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
          </svg>
        </div>

        <div className="flex-1 flex flex-col gap-4 w-full px-2">
          <NavButton 
            active={activeNav === 'chats'} 
            onClick={() => setActiveNav('chats')} 
            icon={<Icons.Chats className="w-6 h-6" />} 
            label="Chats"
          />
          <NavButton 
            active={activeNav === 'calls'} 
            onClick={() => setActiveNav('calls')} 
            icon={<Icons.Calls className="w-6 h-6" />} 
            label="Calls"
          />
          <NavButton 
            active={activeNav === 'contacts'} 
            onClick={() => setActiveNav('contacts')} 
            icon={<Icons.Contacts className="w-6 h-6" />} 
            label="Contacts"
          />
          <NavButton 
            active={activeNav === 'search'} 
            onClick={() => setActiveNav('search')} 
            icon={<Icons.Search className="w-6 h-6" />} 
            label="Search"
          />
        </div>

        <div className="mt-auto flex flex-col gap-4 w-full px-2">
          <NavButton 
            active={false}
            onClick={()=>{}} 
            icon={<Icons.Settings className="w-6 h-6" />} 
            label="Settings"
          />
          <button className="group relative flex items-center justify-center p-3 rounded-xl transition-all hover:bg-slate-100" onClick={()=>{setProfilePage(true)}}>
            <Avatar src={avatar_url} size="sm" />
            <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
              Profile
            </div>
          </button>
        </div>
      </nav>

      <aside className="w-80 md:w-96 bg-white border-r border-slate-200 flex flex-col flex-shrink-0">
        <CenterPanelContent 
          activeNav={activeNav} 
          chats={chats} 
          selectedChatId={selectedChatId}
          onSelectChat={setSelectedChatId}
        />
      </aside>

      <main className="flex-1 relative flex flex-col bg-[#f0f2f5] min-w-0">
        {isCalling ? (
          <CallScreen type={isCalling} onClose={() => setIsCalling(null)} contactName={activeChat?.name || 'Unknown'} avatar={activeChat?.avatar || ''} />
        ) : selectedChatId ? (
          <ChatWindow 
            chat={activeChat} 
            messages={messages[selectedChatId] || []} 
            onSendMessage={sendMessage}
            isTyping={isTyping}
            onStartCall={(type) => setIsCalling(type)}
          />
        ) : profilePage ? (
          <ProfileScreen user={user} onClose={() => setProfilePage(false)} />
        ) : (
          <EmptyState />
        )}
      </main>
    </div>
  );
}
export default mainapp;