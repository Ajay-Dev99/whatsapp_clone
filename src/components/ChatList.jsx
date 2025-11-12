import { TbMessage2Plus } from "react-icons/tb";
import { CiMenuKebab } from "react-icons/ci";
import { FaSearch } from "react-icons/fa";
import { useState, useRef, useEffect, useCallback } from "react";
import { PiUsersThreeFill } from "react-icons/pi";
import { useNavigate } from "react-router-dom";
import { useUserList } from "../hooks/useUserList";
import { formatLastSeen, DEFAULT_AVATAR } from "../utils/format";

function ChatList() {
    const navigate = useNavigate();
    const [selectedChat, setSelectedChat] = useState(null);
    const [selectedInsight, setSelectedInsight] = useState('All');
    const [menuOpen, setMenuOpen] = useState(false);
    const sentinelRef = useRef(null);

    const {
        data,
        isLoading,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useUserList(10);

    // flatten pages into a single users array
    const users = data?.pages?.flatMap(p => p.data || p.users || []) || [];

    console.log(users, "users>>");

    const handleChatSelect = (user) => {
        setSelectedChat(user.id);
        // For now we just set selected chat locally. Marking messages read should be handled via API.
    }

    // IntersectionObserver to trigger loading next page
    const onIntersect = useCallback((entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

    useEffect(() => {
        const node = sentinelRef.current;
        if (!node) return;
        const io = new IntersectionObserver(onIntersect, { root: null, rootMargin: '200px', threshold: 0.1 });
        io.observe(node);
        return () => io.disconnect();
    }, [onIntersect]);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        localStorage.removeItem('authTokenExpiresAt');
        navigate('/');
    }

    return (
        <div className='flex flex-col h-screen py-3'>
            {/* Header */}
            <div className="flex justify-between mb-5">
                <h1 className='text-white ms-4 text-[1.5rem] font-medium'>WhatsApp</h1>
                <div className="flex gap-2 pe-1 items-center">
                    <TbMessage2Plus className='text-white text-[1.5rem] cursor-pointer' />
                    <div className="relative">
                        <CiMenuKebab className='text-white text-[1.5rem] cursor-pointer' onClick={() => setMenuOpen(!menuOpen)} />
                        {menuOpen && (
                            <div className="absolute left-0 mt-2 w-56 bg-[#222] rounded-2xl shadow-lg py-3 z-50 border border-[#333] flex flex-col gap-2 animate-fade-in">
                                <button className="flex items-center gap-3 px-5 py-2 text-white hover:bg-[#333] text-[1rem]">
                                    <PiUsersThreeFill className="text-[1.2rem]" />
                                    New group
                                </button>
                                <button className="flex items-center gap-3 px-5 py-2 text-white hover:bg-[#333] text-[1rem]">
                                    <span className="text-[1.2rem]">★</span>
                                    Starred messages
                                </button>
                                <button className="flex items-center gap-3 px-5 py-2 text-white hover:bg-[#333] text-[1rem]">
                                    <span className="text-[1.2rem]">☑</span>
                                    Select chats
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
                        placeholder="Search or start a new chat"
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
            {/* Chat List */}
            <div className="flex-1 flex flex-col gap-3 overflow-y-auto mt-3 hide-scrollbar px-3">
                {isLoading && <div className="text-[#a3acac] p-4">Loading...</div>}
                {error && <div className="text-red-400 p-4">Failed to load users</div>}

                {!isLoading && !error && users.length === 0 && (
                    <div className="text-[#a3acac] p-6 text-center bg-[#1f2020] border border-[#2a2c2c] rounded-xl">
                        No users available yet.
                    </div>
                )}

                {users.map(user => {
                    const avatar = user.avatar || DEFAULT_AVATAR;
                    const lastSeenText = formatLastSeen(user.lastSeen);
                    return (
                        <div key={(user._id || user.id) + (user.lastSeen || '')} className="flex items-center gap-3 px-5 cursor-pointer hover:bg-[#222] py-2 rounded-md" onClick={() => handleChatSelect(user)} style={{ backgroundColor: selectedChat === (user._id || user.id) ? '#222' : 'transparent' }}>
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-[#222]">
                                <img src={avatar} alt="avatar" className='w-full h-full rounded-full object-cover' />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between">
                                    <h1 className='text-white text-[1rem] font-medium'>{user.name || (user.email || '').split('@')[0]}</h1>
                                    <span className={`${(user.unreadCount || 0) > 0 ? 'text-[#21c063]' : 'text-[#909090]'} text-[0.7rem]`}>{lastSeenText} </span>
                                </div>

                                <div className="flex items-center justify-between mt-1">
                                    <p className='text-[#a3acac] text-[0.8rem] m-0'>{user.lastMessage || ''}</p>
                                    {(user.unreadCount || 0) > 0 && <span className="w-5 h-5 flex items-center justify-center rounded-full bg-[#21c063] text-white text-xs font-semibold ml-2">{user.unreadCount}</span>}
                                </div>
                            </div>
                        </div>
                    )
                })}

                {/* sentinel element observed by IntersectionObserver to trigger next page load */}
                <div ref={sentinelRef} className="w-full h-6" />

                {isFetchingNextPage && <div className="text-[#a3acac] p-4">Loading more...</div>}
                {users.length > 0 && !hasNextPage && !isLoading && <div className="text-[#777] text-center p-3">No more users</div>}
            </div>
        </div>
    )
}

export default ChatList
