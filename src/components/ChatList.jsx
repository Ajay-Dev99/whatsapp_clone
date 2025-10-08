import { TbMessage2Plus } from "react-icons/tb";
import { CiMenuKebab } from "react-icons/ci";



function ChatList() {
    return (
        <div className='flex flex-col  gap-5 py-3'>
            <div className="flex justify-between">
                <h1 className='text-white ms-4 text-[1.5rem] font-bold'>WhatsApp</h1>
                <div className="flex gap-2 pe-1 items-center">
                    <div>
                        <TbMessage2Plus className='text-white text-[1.5rem]  cursor-pointer' />
                    </div>
                    <div>
                        <CiMenuKebab className='text-white text-[1.5rem]  cursor-pointer' />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChatList
