import React from 'react'
import { BsFillChatLeftTextFill } from "react-icons/bs";
import { GrEmptyCircle } from "react-icons/gr";
import { PiChatCircleText } from "react-icons/pi";
import { PiUsersThreeFill } from "react-icons/pi";
import { FaRegCircle } from "react-icons/fa";
import { CiSettings } from "react-icons/ci";







export default function Sidebar() {
    // Tooltip helper
    const Tooltip = ({ text }) => (
        <span className="absolute top-0 left-full ml-2 px-3 py-1 bg-white text-black text-sm font-semibold rounded shadow-lg whitespace-nowrap z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
            {text}
        </span>
    );

    return (
        <div className='flex flex-col items-center justify-between h-full py-5'>
            <div className='flex flex-col gap-5 w-[100%] items-center'>
                <div className="relative group">
                    <BsFillChatLeftTextFill className='text-white text-[1.5rem]' />
                    <Tooltip text="Chats" />
                </div>
                <div className="relative group">
                    <GrEmptyCircle className='text-white text-[1.5rem]' />
                    <Tooltip text="Status" />
                </div>
                <div className="relative group">
                    <PiChatCircleText className='text-white text-[1.5rem]' />
                    <Tooltip text="Channels" />
                </div>
                <div className="relative group">
                    <PiUsersThreeFill className='text-white text-[1.5rem]' />
                    <Tooltip text="Communities" />
                </div>
                <hr className='border-white w-[80%]' />
                <div className="relative group">
                    <FaRegCircle className='text-[#7055ff] text-[1.5rem] font-bold' />
                    <Tooltip text="Meta AI" />
                </div>
            </div>

            <div className='flex flex-col gap-5 w-[100%] items-center px-[0.5rem]'>
                <div className="relative group">
                    <CiSettings className='text-white text-[1.5rem]' />
                    <Tooltip text="Settings" />
                </div>
                <div className='w-10 h-10 relative group'>
                    <img src="https://png.pngtree.com/png-clipart/20230927/original/pngtree-man-avatar-image-for-profile-png-image_13001877.png" alt="" className='w-full h-full rounded-full' />
                    <Tooltip text="Profile" />
                </div>
            </div>
        </div>
    )
}
