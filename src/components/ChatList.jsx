import { TbMessage2Plus } from "react-icons/tb";
import { CiMenuKebab } from "react-icons/ci";
import { FaSearch } from "react-icons/fa";
import { use, useState } from "react";
import { PiUsersThreeFill } from "react-icons/pi";
import { useNavigate } from "react-router-dom";

const users = [
    {
        id: 1,
        name: "John Doe",
        avatar: "https://png.pngtree.com/png-clipart/20230927/original/pngtree-man-avatar-image-for-profile-png-image_13001877.png",
        lastMessage: "Hey! How are you?",
        lastSeen: "10:30 AM",
        unreadCount: 2
    },
    {
        id: 2,
        name: "Jane Smith",
        avatar: "https://png.pngtree.com/png-clipart/20230927/original/pngtree-man-avatar-image-for-profile-png-image_13001877.png",
        lastMessage: "I'm good, thanks!",
        lastSeen: "10:31 AM",
        unreadCount: 5
    },
    {
        id: 3,
        name: "Alice Johnson",
        avatar: "https://png.pngtree.com/png-clipart/20230927/original/pngtree-man-avatar-image-for-profile-png-image_13001877.png",
        lastMessage: "What about you?",
        lastSeen: "10:32 AM",
        unreadCount: 3
    },
    {
        id: 4,
        name: "John Doe",
        avatar: "https://png.pngtree.com/png-clipart/20230927/original/pngtree-man-avatar-image-for-profile-png-image_13001877.png",
        lastMessage: "Hey! How are you?",
        lastSeen: "10:30 AM"
    },
    {
        id: 5,
        name: "Jane Smith",
        avatar: "https://png.pngtree.com/png-clipart/20230927/original/pngtree-man-avatar-image-for-profile-png-image_13001877.png",
        lastMessage: "I'm good, thanks!",
        lastSeen: "10:31 AM"
    },
    {
        id: 6,
        name: "Alice Johnson",
        avatar: "https://png.pngtree.com/png-clipart/20230927/original/pngtree-man-avatar-image-for-profile-png-image_13001877.png",
        lastMessage: "What about you?",
        lastSeen: "10:32 AM"
    },
    {
        id: 7,
        name: "John Doe",
        avatar: "https://png.pngtree.com/png-clipart/20230927/original/pngtree-man-avatar-image-for-profile-png-image_13001877.png",
        lastMessage: "Hey! How are you?",
        lastSeen: "10:30 AM"
    },
    {
        id: 8,
        name: "Jane Smith",
        avatar: "https://png.pngtree.com/png-clipart/20230927/original/pngtree-man-avatar-image-for-profile-png-image_13001877.png",
        lastMessage: "I'm good, thanks!",
        lastSeen: "10:31 AM"
    },
    {
        id: 9,
        name: "Alice Johnson",
        avatar: "https://png.pngtree.com/png-clipart/20230927/original/pngtree-man-avatar-image-for-profile-png-image_13001877.png",
        lastMessage: "What about you?",
        lastSeen: "10:32 AM"
    }
];

function ChatList() {
    const navigate = useNavigate();
    const [selectedChat, setSelectedChat] = useState(null);
    const [selectedInsight, setSelectedInsight] = useState('All');
    const [menuOpen, setMenuOpen] = useState(false);


    const handleChatSelect = (user) => {
        setSelectedChat(user.id);

        users.forEach(u => {
            if (u.id === user.id) {
                u.unreadCount = 0;
            }
        })
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
                                <button className="flex items-center gap-3 px-5 py-2 text-white hover:bg-[#333] text-[1rem]" onClick={() => navigate('/')}>
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
                {users.map(user => (
                    <div key={user.id + user.lastSeen} className="flex items-center gap-3 px-5 cursor-pointer hover:bg-[#222] py-2 rounded-md" onClick={() => handleChatSelect(user)} style={{ backgroundColor: selectedChat === user.id ? '#222' : 'transparent' }}>
                        <div className="w-12 h-12 rounded-full">
                            <img src={user.avatar} alt="" className='w-full h-full rounded-full' />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between">
                                <h1 className='text-white text-[1rem] font-medium'>{user.name}</h1>
                                <span className={`${user.unreadCount > 0 ? 'text-[#21c063]' : 'text-[#909090]'} text-[0.7rem]`}>{user.lastSeen} </span>
                            </div>

                            <div className="flex items-center justify-between mt-1">
                                <p className='text-[#a3acac] text-[0.8rem] m-0'>{user.lastMessage}</p>
                                {user.unreadCount > 0 && <span className="w-5 h-5 flex items-center justify-center rounded-full bg-[#21c063] text-white text-xs font-semibold ml-2">{user.unreadCount}</span>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ChatList
