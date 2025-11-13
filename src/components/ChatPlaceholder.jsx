import React from "react";
import { FaComments } from "react-icons/fa";

const ChatPlaceholder = () => {
    return (
        <div className="flex flex-col h-screen bg-[#0b141a] items-center justify-center text-center px-6">
            <div className="max-w-md space-y-6">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-[#1f4f3a] to-[#113526] shadow-lg shadow-black/30 mx-auto">
                    <FaComments className="text-4xl text-[#53bdeb]" />
                </div>
                <div>
                    <h2 className="text-white text-3xl font-semibold mb-3">
                        Your chats are waiting
                    </h2>
                    <p className="text-[#9aa6ac] text-sm leading-relaxed">
                        Start a conversation by selecting a chat on the left or create a new one.
                        Messages will appear here once you pick a contact.
                    </p>
                </div>

            </div>
        </div>
    );
};

export default ChatPlaceholder;

