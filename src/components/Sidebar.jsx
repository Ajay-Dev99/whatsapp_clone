import React from 'react'
import { BsFillChatLeftTextFill } from "react-icons/bs";
import { GrEmptyCircle } from "react-icons/gr";
import { PiChatCircleText } from "react-icons/pi";
import { PiUsersThreeFill } from "react-icons/pi";
import { FaRegCircle } from "react-icons/fa";
import { CiSettings } from "react-icons/ci";







export default function Sidebar() {
    return (
        <div className='flex flex-col items-center justify-between h-full py-5'>
            <div className='flex flex-col gap-5 w-[100%] items-center'>
                <div>
                    <BsFillChatLeftTextFill className='text-white text-[1.5rem]' />
                </div>
                <div>
                    <GrEmptyCircle className='text-white text-[1.5rem]' />
                </div>
                <div>
                    <PiChatCircleText className='text-white text-[1.5rem]' />
                </div>
                <div>
                    <PiUsersThreeFill className='text-white text-[1.5rem]' />
                </div>
                <hr className='border-white w-[80%]' />
                <div>
                    <FaRegCircle className='text-[#7055ff] text-[1.5rem] font-bold' />
                </div>
            </div>


            <div className='flex flex-col gap-5 w-[100%] items-center px-[0.5rem]'>
                <div>
                    <CiSettings className='text-white text-[1.5rem]' />
                </div>
                <div>
                    <img src="https://png.pngtree.com/png-clipart/20230927/original/pngtree-man-avatar-image-for-profile-png-image_13001877.png" alt="" className='w-full h-full rounded-full' />
                </div>
            </div>
        </div>
    )
}
