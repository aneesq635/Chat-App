import React from "react";
import {CONSTANTS} from './constant';
const { Icons } = CONSTANTS;
    
import { Avatar } from "./Utilities";


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

export default CallScreen;