import React from 'react'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100 py-12 px-6 md:px-12">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-indigo-600 rounded-sm"></div>
          </div>
          <span className="text-lg font-bold text-slate-900">NexTalk</span>
        </div>
        
        {/* <div className="flex gap-8 text-sm text-slate-500 font-medium">
          <a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-indigo-600 transition-colors">Contact Support</a>
        </div> */}
        
        <p className="text-sm text-slate-400">
          &copy; {new Date().getFullYear()} Communica Inc. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
