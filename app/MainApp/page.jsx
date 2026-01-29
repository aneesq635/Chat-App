"use client";
import React, { useState, useEffect, useRef, useCallback, use } from "react";
import { useAuth } from "../components/AuthContext";
import { CONSTANTS } from "../components/constant";
const { Icons, INITIAL_CHATS, INITIAL_CALLS, INITIAL_CONTACTS } = CONSTANTS;
import ProfileScreen from "../components/ProfileScreen";
import CallScreen from "../components/CallScreen";
import CenterPanelContent from "../components/CenterPanelContent";
import { Avatar, EmptyState, NavButton } from "../components/Utilities";
import ChatWindow from "../components/ChatWindow";

import {
  setActiveNav,
  setChats,
  setSelectedChatId,
  setIsCalling,
} from "../components/MainSlice";
import { useSelector, useDispatch } from "react-redux";

const mainapp = () => {
  // all states
  const activeNav = useSelector((state) => state.main.activeNav);
  const selectedChatId = useSelector((state) => state.main.selectedChatId);
  const chats = useSelector((state) => state.main.chats);
  const isCalling = useSelector((state) => state.main.isCalling);
  const [profilePage, setProfilePage] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const dispatch = useDispatch();
  const activeChat = chats.find((c) => c.id === selectedChatId);

  const { user } = useAuth();
  const avatar_url = user?.user_metadata?.avatar_url;
  console.log("user", user);

  // function and useEffects
  // Fetch user chats when component mounts or user changes
  useEffect(() => {
    const fetchUserChats = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch(`/api/chats/user?userId=${user.id}`);
        const { chats: userChats } = await response.json();
        console.log("fetching chats", userChats);

        const formattedChats = userChats.map((chat) => {
          // Get the other participant (not current user)
          const otherParticipant = chat.participantDetails.find(
            (p) => p.supabaseId !== user.id,
          );

        

          return {
            id: chat._id.toString(),
            name: otherParticipant?.name || "Unknown",
            avatar: otherParticipant?.avatar || "",
            lastMessage: chat.lastMessage || "",
            timestamp: chat.timestamp ? formatTimestamp(chat.timestamp) : "",
            unreadCount: participantmeta.unreadCount || 0,
            status: chat.status ||otherParticipant?.status || "offline",
            userId: otherParticipant?.supabaseId,
          };
        });
        console.log("formated chats", formattedChats);
        dispatch(setChats(formattedChats));
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };

    fetchUserChats();
  }, [user, dispatch]);

  // Helper function for timestamp
  const formatTimestamp = (date) => {
    const now = new Date();
    const chatDate = new Date(date);
    const diffMs = now - chatDate;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return chatDate.toLocaleDateString();
  };

  const profilePageOn = (user) => {
    console.log("Profile user in MainApp: ", user);

    setProfileUser(user);
    setProfilePage(true);
  };

  // all logs
  console.log("profile page state", profilePage);
  console.log("active nav", activeNav);

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* Navigation Bar */}
      <nav className="w-16 md:w-20 bg-white border-r border-slate-200 flex flex-col items-center py-6 flex-shrink-0 z-50">
        <div className="mb-8 p-2 bg-indigo-600 rounded-xl text-white">
          <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current">
            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
          </svg>
        </div>

        <div className="flex-1 flex flex-col gap-4 w-full px-2">
          <NavButton
            active={activeNav === "chats"}
            onClick={() => dispatch(setActiveNav("chats"))}
            icon={<Icons.Chats className="w-6 h-6" />}
            label="Chats"
          />
          <NavButton
            active={activeNav === "calls"}
            onClick={() => dispatch(setActiveNav("calls"))}
            icon={<Icons.Calls className="w-6 h-6" />}
            label="Calls"
          />
          <NavButton
            active={activeNav === "contacts"}
            onClick={() => dispatch(setActiveNav("contacts"))}
            icon={<Icons.Contacts className="w-6 h-6" />}
            label="Contacts"
          />
          <NavButton
            active={activeNav === "search"}
            onClick={() => dispatch(setActiveNav("search"))}
            icon={<Icons.Search className="w-6 h-6" />}
            label="Search"
          />
        </div>

        <div className="mt-auto flex flex-col gap-4 w-full px-2">
          <NavButton
            active={false}
            onClick={() => {}}
            icon={<Icons.Settings className="w-6 h-6" />}
            label="Settings"
          />
          <button
            className="group relative flex items-center justify-center p-3 rounded-xl transition-all hover:bg-slate-100"
            onClick={() => {
              setProfilePage(true);
              setProfileUser(user);
            }}
          >
            <Avatar src={avatar_url} size="sm" />
            <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
              Profile
            </div>
          </button>
        </div>
      </nav>

      <aside className="w-80 md:w-96 bg-white border-r border-slate-200 flex flex-col flex-shrink-0">
        <CenterPanelContent onSelectProfile={profilePageOn} user={user} />
      </aside>

      <main className="flex-1 relative flex flex-col bg-[#f0f2f5] min-w-0">
        {isCalling ? (
          <CallScreen
            type={isCalling}
            onClose={() => dispatch(setIsCalling(null))}
            contactName={activeChat?.name || "Unknown"}
            avatar={activeChat?.avatar || ""}
          />
        ) : selectedChatId ? (
          <ChatWindow
            chat={activeChat}
            selectedChatId={selectedChatId}
            onStartCall={(type) => dispatch(setIsCalling(type))}
          />
        ) : profilePage ? (
          <ProfileScreen
            user={profileUser}
            onClose={() => setProfilePage(false)}
          />
        ) : (
          <EmptyState />
        )}
      </main>
    </div>
  );
};
export default mainapp;
