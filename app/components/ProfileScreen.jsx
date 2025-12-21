"use client";
import React, { useState, useEffect } from "react";

import {
  ChevronLeft,
  Check,
  Copy,
  Share,
  MoreVertical,
  MessageCircle,

} from "lucide-react";

const ProfileScreen = ({ user, onClose, onStartChat }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  console.log("ProfileScreen user prop:", user.id);

  // Mock fetching profile data - simulating backend response
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        // Simulate API delay
        const data = await fetch(`/api/users/${user.id}`);
        const profile = await data.json();
        console.log("Fetched profile data:", profile);
        setProfileData(profile);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleCopy = async () => {
    if (!profileData) return;
    try {
      await navigator.clipboard.writeText(profileData.user.userId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleShare = async () => {
    if (!profileData) return;
    const shareData = {
      title: profileData.user.name,
      text: `Check out ${profileData.user.name}'s profile on NexTalk!`,
      url: `https://nextalk.app/profile/${profileData.user.userId}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="text-slate-500 font-medium tracking-wide">
            Fetching Profile...
          </p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200 border border-slate-100 text-center max-w-sm w-full">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            Profile Not Found
          </h3>
          <p className="text-slate-500 mb-8">
            We couldn't find the user profile you were looking for.
          </p>
          <button
            onClick={onClose}
            className="w-full py-3.5 bg-indigo-600 text-white rounded-2xl font-semibold hover:bg-indigo-700 transition-all active:scale-[0.98] shadow-lg shadow-indigo-100"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 flex flex-col items-center animate-in fade-in duration-500 overflow-y-auto pb-24">
      {/* Top Header / Navigation */}
      <div className="sticky top-0 w-full px-6 py-4 flex items-center justify-between bg-slate-50/80 backdrop-blur-md z-[110]">
        <button
          onClick={onClose}
          className="w-11 h-11 bg-white hover:bg-slate-50 text-slate-700 rounded-2xl flex items-center justify-center transition-all border border-slate-200 shadow-sm active:scale-95"
          aria-label="Back"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <h1 className="text-slate-800 font-bold text-lg mr-4">Profile</h1>

      </div>

      <div className="w-full max-w-2xl px-6 pt-4 flex flex-col items-center">
        {/* Profile Card */}
        <div className="w-full bg-white rounded-[40px] shadow-2xl shadow-slate-200/60 border border-white p-8 relative overflow-hidden flex flex-col items-center">
          {/* Subtle Background Accent */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-indigo-50 to-purple-50 -z-0"></div>

          {/* Avatar Area */}
          <div className="relative mt-8 mb-6 z-10 group">
            <div className="relative w-36 h-36 p-1 bg-white rounded-[44px] shadow-2xl shadow-indigo-200/50">
              <img
                src={profileData.user.avatar}
                alt={profileData.user.name}
                className="w-full h-full object-cover rounded-[40px]"
              />
              <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-white p-1.5 rounded-2xl shadow-lg border border-slate-50">
                <div
                  className={`w-full h-full rounded-xl shadow-inner ${
                    profileData.user.status === "online"
                      ? "bg-green-500"
                      : "bg-slate-300"
                  }`}
                ></div>
              </div>
            </div>
            {/* Pulsing ring for online status */}
            {profileData.user.status === "online" && (
              <div className="absolute inset-0 rounded-[44px] border-4 border-indigo-500/10 animate-ping -z-10"></div>
            )}
          </div>

          {/* Identity */}
          <div className="text-center z-10 mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-1 leading-tight">
              {profileData.user.name}
            </h2>
            <div className="flex items-center justify-center gap-2">
              <span className="text-indigo-600 font-bold text-sm bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                @{profileData.user.userId}
              </span>
              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
              {/* <span className="text-slate-400 font-medium text-sm">{profileData.location}</span> */}
            </div>
          </div>

          {/* Bio Section */}
          {profileData.user.bio ? (
            <div className="w-full bg-slate-50/50 rounded-3xl p-6 mb-8 border border-slate-100 text-center">
              <p className="text-slate-600 leading-relaxed font-medium italic">
                {profileData.user.bio}
              </p>
            </div>
          ) : (
             <button
            onClick={() => alert("Add Bio functionality coming soon!")}
            className="h-14 px-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all hover:scale-[1.02] active:scale-95 flex items-center mb-8 cursor-pointer"
          >
            
            <span>Add Bio</span>
          </button>
          )}

          {/* Stats / Info Badges */}
          <div className="grid grid-cols-2 gap-4 w-full mb-8">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col items-center">
              <span className="text-slate-400 text-[10px] uppercase tracking-widest font-bold mb-1">
                Joined
              </span>
              <span className="text-slate-700 font-bold">
                {profileData.user.createdAt}
              </span>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col items-center">
              <span className="text-slate-400 text-[10px] uppercase tracking-widest font-bold mb-1">
                Status
              </span>
              <span className="text-green-600 font-bold flex items-center gap-1.5 capitalize">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                {profileData.user.status || "offline"}
              </span>
            </div>
          </div>

          {/* User ID Action Row */}
          <div className="w-full flex items-center gap-3">
            <button
              onClick={handleCopy}
              className={`flex-1 h-14 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all border ${
                copied
                  ? "bg-green-500 text-white border-green-500"
                  : "bg-white text-slate-800 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  <span>Copy ID</span>
                </>
              )}
            </button>

            <button
              onClick={handleShare}
              className={`flex-1 h-14 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all border ${
                shareSuccess
                  ? "bg-green-500 text-white border-green-500"
                  : "bg-white text-indigo-600 border-indigo-100 hover:bg-indigo-50"
              }`}
            >
              {shareSuccess ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>Shared!</span>
                </>
              ) : (
                <>
                  <Share className="w-5 h-5" />
                  <span>Share Profile</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* UUID Transparency Section */}
        <div className="w-full mt-6 px-4 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          <span>Unique Identity</span>
          <span className="font-mono text-slate-300">
            #{`${profileData.user.supabaseId.split("-")[0]}...`}
          </span>
        </div>
      </div>

      {/* Floating Action Buttons */}
      {/* <div className="fixed bottom-0 left-0 right-0 p-6 flex items-center justify-center pointer-events-none">
        <div className="bg-white/90 backdrop-blur-xl p-3 rounded-[32px] flex items-center gap-3 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/50 pointer-events-auto">
          
          <button
            onClick={() => onStartChat(profileData.id)}
            className="h-14 px-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-indigo-200 flex items-center gap-3"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Start Chat</span>
          </button>

          <button
            onClick={onClose}
            className="h-14 px-8 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-bold transition-all active:scale-95"
          >
            Not Now
          </button>

        </div>
      </div> */}
    </div>
  );
};

export default ProfileScreen;
