import { CiMenuKebab } from "react-icons/ci";
import { FaSearch, FaCheckDouble } from "react-icons/fa";
import { MdPersonAdd, MdNotifications } from "react-icons/md";
import { useState, useEffect } from "react";
import { PiUsersThreeFill } from "react-icons/pi";
import { useNavigate } from "react-router-dom";
import { useConnections, useReceivedRequests } from "../hooks/useConnections";
import { DEFAULT_AVATAR } from "../utils/format";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedChat } from "../global/features/userSlice";
import useSocket from "../hooks/useSocket";
import { setRoom } from "../global/features/roomSlice";
import { useQueryClient } from "@tanstack/react-query";

// Format time for last message
const formatMessageTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (diffDays === 1) {
        return "Yesterday";
    } else if (diffDays < 7) {
        return date.toLocaleDateString([], { weekday: "short" });
    } else {
        return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
};

function ChatList() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const queryClient = useQueryClient();
    const [selectedInsight, setSelectedInsight] = useState("All");
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const socket = useSocket();
    const { selectedChat, user } = useSelector((state) => state?.user ?? {});

    // Fetch connected users (friends) instead of all users
    const { data: connections, isLoading, error, refetch } = useConnections();
    const { data: pendingRequests } = useReceivedRequests();

    // Filter connections based on search and selected insight
    const users = (connections || []).filter(conn => {
        // Search filter
        if (searchQuery) {
            const name = conn.name?.toLowerCase() || "";
            const email = conn.email?.toLowerCase() || "";
            if (!name.includes(searchQuery.toLowerCase()) && !email.includes(searchQuery.toLowerCase())) {
                return false;
            }
        }

        // Insight filter
        if (selectedInsight === "Unread" && !conn.unreadCount) {
            return false;
        }

        return true;
    });

    // Listen for real-time connection and message updates
    useEffect(() => {
        if (!socket) return;

        const handleConnectionAccepted = () => {
            queryClient.invalidateQueries(["connections"]);
        };

        const handleNewMessage = () => {
            // Refresh connections to update last message and unread count
            queryClient.invalidateQueries(["connections"]);
        };

        socket.on("connection:accepted", handleConnectionAccepted);
        socket.on("connection:request:received", () => {
            queryClient.invalidateQueries(["connections", "received"]);
        });
        socket.on("chat:message:receive", handleNewMessage);

        return () => {
            socket.off("connection:accepted", handleConnectionAccepted);
            socket.off("connection:request:received");
            socket.off("chat:message:receive", handleNewMessage);
        };
    }, [socket, queryClient]);

    const handleChatSelect = (chatUser) => {
        const chatPayload = {
            userId: user?._id,
            chatUserId: chatUser?._id,
        };

        if (!socket) return;

        socket.emit("join:room", chatPayload, (response) => {
            if (response?.success) {
                dispatch(setSelectedChat(chatUser));
                dispatch(setRoom(response?.room));
            } else {
                console.warn("Failed to join room", response?.error);
            }
        });
    };

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");
        localStorage.removeItem("authTokenExpiresAt");
        navigate("/");
    };

    const pendingCount = pendingRequests?.length || 0;

    return (
        <div className="flex flex-col h-screen py-3">
            {/* Header */}
            <div className="flex justify-between mb-5">
                <h1 className='text-white ms-4 text-[1.5rem] font-medium'>WhatsApp</h1>
                <div className="flex gap-3 pe-3 items-center">
                    {/* Find People Button */}
                    <button
                        onClick={() => navigate("/users")}
                        className="text-[#8696a0] hover:text-white transition-colors"
                        title="Find People"
                    >
                        <MdPersonAdd className='text-[1.5rem]' />
                    </button>

                    {/* Requests Button with Badge */}
                    <button
                        onClick={() => navigate("/requests")}
                        className="text-[#8696a0] hover:text-white transition-colors relative"
                        title="Connection Requests"
                    >
                        <MdNotifications className='text-[1.5rem]' />
                        {pendingCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center rounded-full bg-[#00a884] text-white text-[0.6rem] font-bold">
                                {pendingCount > 9 ? '9+' : pendingCount}
                            </span>
                        )}
                    </button>

                    <div className="relative">
                        <CiMenuKebab className='text-white text-[1.5rem] cursor-pointer' onClick={() => setMenuOpen(!menuOpen)} />
                        {menuOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-[#222] rounded-2xl shadow-lg py-3 z-50 border border-[#333] flex flex-col gap-2 animate-fade-in">
                                <button
                                    className="flex items-center gap-3 px-5 py-2 text-white hover:bg-[#333] text-[1rem]"
                                    onClick={() => { setMenuOpen(false); navigate("/users"); }}
                                >
                                    <MdPersonAdd className="text-[1.2rem]" />
                                    Find People
                                </button>
                                <button
                                    className="flex items-center gap-3 px-5 py-2 text-white hover:bg-[#333] text-[1rem]"
                                    onClick={() => { setMenuOpen(false); navigate("/requests"); }}
                                >
                                    <MdNotifications className="text-[1.2rem]" />
                                    Requests
                                    {pendingCount > 0 && (
                                        <span className="ml-auto px-2 py-0.5 bg-[#00a884] text-white text-xs rounded-full">
                                            {pendingCount}
                                        </span>
                                    )}
                                </button>
                                <button className="flex items-center gap-3 px-5 py-2 text-white hover:bg-[#333] text-[1rem]">
                                    <PiUsersThreeFill className="text-[1.2rem]" />
                                    New group
                                </button>
                                <hr className="border-[#333] mx-5" />
                                <button className="flex items-center gap-3 px-5 py-2 text-white hover:bg-[#333] text-[1rem]" onClick={handleLogout}>
                                    <span className="text-[1.2rem]">↩</span>
                                    Log out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Search Bar */}
            <div className="px-5 mb-4">
                <div className="relative w-full">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a3acac]">
                        <FaSearch />
                    </span>
                    <input
                        type="text"
                        className="w-full pl-10 p-2 rounded-4xl placeholder:text-[#a3acac] bg-[#222] text-white"
                        placeholder="Search connections"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>
            {/* Insights */}
            <div className="flex gap-2 px-5 mb-4">
                {['All', 'Unread', 'Favourites', 'Groups'].map(insight => (
                    <button
                        key={insight}
                        className={`text-[0.9rem] px-3 py-1 border border-[#343636] rounded-full transition-colors duration-150 ${selectedInsight === insight ? 'bg-[#103529] text-white' : 'bg-transparent text-[#909090]'}`}
                        onClick={() => setSelectedInsight(insight)}
                    >
                        <span>{insight}</span>
                    </button>
                ))}
            </div>
            {/* Chat List - Connected Users Only */}
            <div className="flex-1 flex flex-col gap-3 overflow-y-auto mt-3 hide-scrollbar px-3">
                {isLoading && <div className="text-[#a3acac] p-4 text-center">Loading connections...</div>}
                {error && <div className="text-red-400 p-4 text-center">Failed to load connections</div>}

                {!isLoading && !error && users.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                        <div className="w-20 h-20 rounded-full bg-[#1f2c33] flex items-center justify-center mb-4">
                            <MdPersonAdd className="text-4xl text-[#8696a0]" />
                        </div>
                        <h3 className="text-white text-lg font-medium mb-2">No connections yet</h3>
                        <p className="text-[#8696a0] text-sm mb-4">
                            Find and connect with people to start chatting
                        </p>
                        <button
                            onClick={() => navigate("/users")}
                            className="px-4 py-2 bg-[#00a884] text-white rounded-lg hover:bg-[#008f6f] transition-colors flex items-center gap-2"
                        >
                            <MdPersonAdd className="text-lg" />
                            Find People
                        </button>
                    </div>
                )}

                {users.map(connUser => {
                    const avatar = connUser.profilePicture || connUser.avatar || DEFAULT_AVATAR;
                    const isActive = selectedChat?._id === connUser._id;
                    const hasUnread = connUser.unreadCount > 0;
                    const lastMessage = connUser.lastMessage;
                    const messageTime = formatMessageTime(lastMessage?.createdAt);

                    // Get preview text for last message
                    const getMessagePreview = () => {
                        if (!lastMessage) return "Start a conversation";
                        const prefix = lastMessage.isFromMe ? "You: " : "";
                        const content = lastMessage.type === "text"
                            ? lastMessage.content
                            : `📎 ${lastMessage.type}`;
                        return prefix + content;
                    };

                    return (
                        <div
                            key={connUser._id}
                            className={`flex items-center gap-3 px-4 cursor-pointer hover:bg-[#1f2c33] py-3 rounded-lg transition-colors ${isActive ? 'bg-[#1f2c33]' : ''}`}
                            onClick={() => handleChatSelect(connUser)}
                        >
                            <div className="relative">
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-[#1f2c33]">
                                    <img src={avatar} alt="avatar" className='w-full h-full object-cover' />
                                </div>
                                {connUser.online && (
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#00a884] rounded-full border-2 border-[#0b141a]"></div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                    <h1 className={`text-[1rem] font-medium truncate ${hasUnread ? 'text-white' : 'text-white'}`}>
                                        {connUser.name || (connUser.email || '').split('@')[0]}
                                    </h1>
                                    <span className={`text-[0.7rem] flex-shrink-0 ml-2 ${hasUnread ? 'text-[#00a884]' : 'text-[#8696a0]'}`}>
                                        {messageTime}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center mt-0.5">
                                    <p className={`text-[0.8rem] truncate flex-1 ${hasUnread ? 'text-[#d1d7db] font-medium' : 'text-[#8696a0]'}`}>
                                        {lastMessage?.isFromMe && (
                                            <span className="inline-flex items-center mr-1">
                                                <FaCheckDouble className={`text-[0.65rem] ${lastMessage.status === 'read' ? 'text-[#53bdeb]' : 'text-[#8696a0]'}`} />
                                            </span>
                                        )}
                                        {getMessagePreview()}
                                    </p>
                                    {hasUnread && (
                                        <span className="flex-shrink-0 ml-2 min-w-[20px] h-[20px] flex items-center justify-center rounded-full bg-[#00a884] text-white text-[0.7rem] font-medium px-1.5">
                                            {connUser.unreadCount > 99 ? '99+' : connUser.unreadCount}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                })}

                {users.length > 0 && (
                    <div className="text-[#8696a0] text-center p-3 text-sm">
                        {users.length} connection{users.length !== 1 ? 's' : ''}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ChatList
