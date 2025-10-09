import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function LandingPage() {
    const navigate = useNavigate()
    return (
        <div className='flex flex-col gap-2 items-center justify-center h-screen bg-[#181917]'>
            <div className='h-80 w-80 rounded-md animate-pulse flex items-center justify-center'>
                <img src="landing.png" alt="temp" className='rounded-full w-full h-full object-cover' />
            </div>
            <h1 className='text-white text-[1.5rem]'>Welcome to the WhatsApp</h1>
            <p className='text-[#909090] text-[1rem]'>A simple , reliable , and private way to  use WhatsApp on your computer</p>
            <button className='bg-[#1daa61] px-[3rem] py-1 rounded-sm text-sm my-3 cursor-pointer' onClick={() => navigate("/home")}>Get Started</button>
            <p className='text-[#909090] text-[1rem]'>Version 2.2535.3.0</p>
            console.log("slfjkdsafklj")
        </div>
    )
}
