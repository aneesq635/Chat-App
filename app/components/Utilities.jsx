import {CONSTANTS} from './constant';
const { Icons, INITIAL_CHATS, INITIAL_CALLS, INITIAL_CONTACTS } = CONSTANTS;
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



export { EmptyState, Avatar, NavButton };