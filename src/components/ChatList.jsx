import { TbMessage2Plus } from "react-icons/tb";
import { CiMenuKebab } from "react-icons/ci";
import { FaSearch } from "react-icons/fa";

const users = [
    {
        id: 1,
        name: "John Doe",
        avatar: "https://png.pngtree.com/png-clipart/20230927/original/pngtree-man-avatar-image-for-profile-png-image_13001877.png",
        lastMessage: "Hey! How are you?",
        lastSeen: "10:30 AM"
    },
    {
        id: 2,
        name: "Jane Smith",
        avatar: "https://png.pngtree.com/png-clipart/20230927/original/pngtree-man-avatar-image-for-profile-png-image_13001877.png",
        lastMessage: "I'm good, thanks!",
        lastSeen: "10:31 AM"
    },
    {
        id: 3,
        name: "Alice Johnson",
        avatar: "https://png.pngtree.com/png-clipart/20230927/original/pngtree-man-avatar-image-for-profile-png-image_13001877.png",
        lastMessage: "What about you?",
        lastSeen: "10:32 AM"
    },
    {
        id: 1,
        name: "John Doe",
        avatar: "https://png.pngtree.com/png-clipart/20230927/original/pngtree-man-avatar-image-for-profile-png-image_13001877.png",
        lastMessage: "Hey! How are you?",
        lastSeen: "10:30 AM"
    },
    {
        id: 2,
        name: "Jane Smith",
        avatar: "https://png.pngtree.com/png-clipart/20230927/original/pngtree-man-avatar-image-for-profile-png-image_13001877.png",
        lastMessage: "I'm good, thanks!",
        lastSeen: "10:31 AM"
    },
    {
        id: 3,
        name: "Alice Johnson",
        avatar: "https://png.pngtree.com/png-clipart/20230927/original/pngtree-man-avatar-image-for-profile-png-image_13001877.png",
        lastMessage: "What about you?",
        lastSeen: "10:32 AM"
    },
    {
        id: 1,
        name: "John Doe",
        avatar: "https://png.pngtree.com/png-clipart/20230927/original/pngtree-man-avatar-image-for-profile-png-image_13001877.png",
        lastMessage: "Hey! How are you?",
        lastSeen: "10:30 AM"
    },
    {
        id: 2,
        name: "Jane Smith",
        avatar: "https://png.pngtree.com/png-clipart/20230927/original/pngtree-man-avatar-image-for-profile-png-image_13001877.png",
        lastMessage: "I'm good, thanks!",
        lastSeen: "10:31 AM"
    },
    {
        id: 3,
        name: "Alice Johnson",
        avatar: "https://png.pngtree.com/png-clipart/20230927/original/pngtree-man-avatar-image-for-profile-png-image_13001877.png",
        lastMessage: "What about you?",
        lastSeen: "10:32 AM"
    }
];

function ChatList() {
    return (
        <div className='flex flex-col  gap-5 py-3'>
            <div className="flex justify-between">
                <h1 className='text-white ms-4 text-[1.5rem] font-medium'>WhatsApp</h1>
                <div className="flex gap-2 pe-1 items-center">
                    <div>
                        <TbMessage2Plus className='text-white text-[1.5rem]  cursor-pointer' />
                    </div>
                    <div>
                        <CiMenuKebab className='text-white text-[1.5rem]  cursor-pointer' />
                    </div>
                </div>
                {/* search bar */}

            </div>
            <div className="px-5">
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
            {/* insights */}
            <div className="flex gap-2 px-5">
                <button className="text-[#909090] text-[0.9rem] px-3 py-1 border border-[#343636] rounded-full ">
                    <span>All</span>
                </button>
                <button className="text-[#909090] text-[0.9rem] px-3 py-1 border border-[#343636] rounded-full ">
                    <span>Unread</span>
                </button>
                <button className="text-[#909090] text-[0.9rem] px-3 py-1 border border-[#343636] rounded-full ">
                    <span>Favourites</span>
                </button>
                <button className="text-[#909090] text-[0.9rem] px-3 py-1 border border-[#343636] rounded-full ">
                    <span>Groups</span>
                </button>
            </div>



            {/* chat list */}
            <div className="flex flex-col gap-3 mt-3 overflow-y-auto">
                {/* chat item */}
                {users.map(user => (
                    < div className="flex items-center gap-3 px-5 cursor-pointer hover:bg-[#222] py-2" >
                        <div className="w-12 h-12 rounded-full">
                            <img src={user.avatar} alt="" className='w-full h-full rounded-full' />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between">
                                <h1 className='text-white text-[1rem] font-medium'>{user.name}</h1>
                                <span className='text-[#a3acac] text-[0.7rem]'>{user.lastSeen} </span>
                            </div>
                            <p className='text-[#a3acac] text-[0.8rem]'>{user.lastMessage}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div >
    )
}

export default ChatList
