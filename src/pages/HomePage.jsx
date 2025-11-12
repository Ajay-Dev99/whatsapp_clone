import React from 'react'
import Sidebar from '../components/sidebar'
import ChatList from '../components/ChatList'
import ChatArea from '../components/ChatArea'
import { useSelector } from 'react-redux'

export default function HomePage() {
    const { user } = useSelector((state) => state?.user)
    console.log(user, "user>> 123")
    return (
        <div className='flex h-screen bg-[#181917]'>
            <div className='w-[5%] border-r border-[#343636] bg-[#1d1f1f]'>
                <Sidebar />
            </div>
            <div className='w-[30%] border-r border-[#343636] bg-[#161717]'>
                <ChatList />
            </div>
            <div className='w-[65%] bg-[#161717]'>
                <ChatArea />
            </div>
        </div>
    )
}
