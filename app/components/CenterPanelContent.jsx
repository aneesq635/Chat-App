import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CONSTANTS } from "./constant";

const { Icons, INITIAL_CALLS } = CONSTANTS;

import { Avatar } from "./Utilities";
import {
  setContacts,
  setActiveNav,
  setChats,
  setSelectedChatId,
} from "./MainSlice";

function CenterPanelContent({ user, onSelectProfile }) {
  // all states
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const dispatch = useDispatch();

  const activeNav = useSelector((state) => state.main.activeNav);
  const selectedChatId = useSelector((state) => state.main.selectedChatId);
  const chats = useSelector((state) => state.main.chats);
  const contacts = useSelector((state) => state.main.contacts);

  // all functions and useEffects
  const filteredChats = chats.filter((c) => {
    const matchesSearch = c.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    if (filter === "unread") return matchesSearch && c.unreadCount > 0;
    return matchesSearch;
  });

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch(`/api/contacts/getContacts/${user.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch contacts");
        }
        const data = await response.json();
        console.log("Fetched contacts:", data);
        dispatch(setContacts(data.contacts || []));
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    };
    if (activeNav === "contacts") {
      fetchContacts();
    } else {
      dispatch(setContacts([]));
    }
  }, [activeNav, dispatch]);

  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (searchTerm && activeNav === "search") {
        setIsSearching(true);
        const results = await searchUsers(searchTerm);
        setSearchResults(results);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(delaySearch);
  }, [searchTerm, activeNav]);
  // chat system

  const handleStartChat = async (contact) => {
    try {
      // Check if chat already exists or create new one
      console.log("userid and supabaseid", user.id, contact.supabaseId);
      const response = await fetch("/api/chat/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participants: [user.id, contact.supabaseId],
        }),
      });

      const { chat } = await response.json();

      // Add to chats list if not already there
      console.log("chat created/fetched:", chat);
      const chatId = chat._id.toString();
      const chatExists = chats.some((c) => c.id === chatId);

      const meta = chat.participantMeta?.[contact.supabaseId] || {
        unreadCount: 0,
      };

      // const status = await fetch(`/api/users/status/${contact.supabaseId}`);
      // const statusData = await status.json();
      // console.log("statusData", statusData);
      // contact.status = statusData.status || "offline";

      if (!chatExists) {
        const newChat = {
          id: chat._id.toString(),
          name: contact.name,
          avatar: contact.avatar,
          userId: contact.supabaseId, // Store the other user's ID
          lastMessage: chat.lastMessage.text,
          timestamp: chat.lastMessage.timestamp,
          unreadCount: meta.unreadCount,
          status: contact.status,
        };

        dispatch(setChats([newChat, ...chats]));
      }

      // Switch to chats tab and select this chat
      dispatch(setActiveNav("chats"));
      dispatch(setSelectedChatId(chat._id.toString()));
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  const searchUsers = async (searchTerm) => {
    if (!searchTerm || searchTerm.trim() === "") {
      return [];
    }

    try {
      const response = await fetch("/api/users/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: searchTerm }),
      });

      if (!response.ok) {
        console.error("Error searching users");
        return [];
      }

      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error("Error searching users:", error);
      return [];
    }
  };

  // all logs
  console.log("user in CenterPanelContent: ", user);

  return (
    <>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-6 capitalize">
          {activeNav}
        </h1>

        <div className="relative mb-6">
          <Icons.Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={
              activeNav === "search" ? "Search by User ID..." : "Search..."
            }
            className="w-full pl-10 pr-4 py-3 bg-slate-100 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl transition-all outline-none text-black text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {activeNav === "chats" && (
          <div className="flex gap-2 mb-4">
            {["all", "unread", "favorites"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  filter === f
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        {activeNav === "chats" &&
          filteredChats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => dispatch(setSelectedChatId(chat.id))}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl mb-1 transition-all ${
                selectedChatId === chat.id
                  ? "bg-indigo-50 border border-indigo-100"
                  : "hover:bg-slate-50"
              }`}
            >
              <Avatar src={chat.avatar} status={chat.status} />
              <div className="flex-1 min-w-0 text-left">
                <div className="flex justify-between items-baseline">
                  <h3
                    className={`font-semibold text-slate-900 truncate ${
                      chat.unreadCount > 0 ? "font-bold" : ""
                    }`}
                  >
                    {chat.name}
                  </h3>
                  <span className="text-xs text-slate-400">
                    {chat.timestamp}
                  </span>
                </div>
                <p className="text-sm text-slate-500 truncate mt-0.5">
                  {chat.lastMessage}
                </p>
              </div>
              {chat.unreadCount > 0 && (
                <div className="w-5 h-5 bg-indigo-600 text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                  {chat.unreadCount}
                </div>
              )}
            </button>
          ))}

        {activeNav === "calls" &&
          INITIAL_CALLS.map((call) => (
            <div
              key={call.id}
              className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-all group"
            >
              <Avatar src={call.avatar} />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 truncate">
                  {call.name}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {call.status === "missed" ? (
                    <Icons.Calls className="w-3 h-3 text-red-500" />
                  ) : (
                    <Icons.Calls className="w-3 h-3 text-green-500 rotate-180" />
                  )}
                  <span className="text-xs text-slate-500 truncate">
                    {call.timestamp}
                  </span>
                </div>
              </div>
              <button className="p-2 text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-50 rounded-full">
                {call.type === "video" ? (
                  <Icons.VideoCall className="w-5 h-5" />
                ) : (
                  <Icons.Calls className="w-5 h-5" />
                )}
              </button>
            </div>
          ))}

        {activeNav === "contacts" &&
          contacts.map((contact) => (
            <>
              <button
                key={contact.id}
                className="w-full flex items-center gap-4 p-4 hover:bg-indigo-50 rounded-2xl transition-all border border-transparent hover:border-indigo-100 mb-2 text-left"
                onClick={() => {
                  onSelectProfile(contact);
                }}
              >
                <Avatar src={contact.avatar} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate">
                    {contact.name}
                  </h3>
                  <p className="text-xs text-black font-medium truncate">
                    {contact.bio}
                  </p>
                </div>
              </button>
              <button
                onClick={() => handleStartChat(contact)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                Chat
              </button>
            </>
          ))}

        {activeNav === "search" &&
          (searchTerm ? (
            <>
              {searchResults.length > 0 ? (
                searchResults.map((user) => (
                  <button
                    key={user._id || user.userId}
                    onClick={() => onSelectProfile(user)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-indigo-50 rounded-2xl transition-all border border-transparent hover:border-indigo-100 mb-2 text-left"
                  >
                    <Avatar src={user.avatar} />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        {user.name || "No Name"}
                      </div>
                      <div className="text-sm text-gray-500">
                        @{user.userId}
                      </div>
                      {/* {user.email && (
                      <div className="text-xs text-gray-400">{user.email}</div>
                    )} */}
                    </div>
                  </button>
                ))
              ) : !isSearching ? (
                <div className="text-center py-12">
                  {/* <div className="text-gray-400 mb-4 text-5xl">🔍</div> */}
                  <p className="text-gray-600 mb-4">
                    No user matches found for "{searchTerm}".
                  </p>
                  <button className="px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors">
                    Invite Friend
                  </button>
                </div>
              ) : null}
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Enter a name, ID, or email to find people on NexTalk.
            </div>
          ))}
      </div>
    </>
  );
}

export default CenterPanelContent;
