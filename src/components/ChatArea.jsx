import React, { useState, useRef, useEffect } from "react";
import { IoMdSend } from "react-icons/io";
import { BsEmojiSmile } from "react-icons/bs";
import { MdAttachFile, MdMoreVert, MdCall, MdVideoCall, MdSearch, MdMic } from "react-icons/md";
import { FaCheck, FaCheckDouble } from "react-icons/fa";
import { useSelector } from "react-redux";
import ChatPlaceholder from "./ChatPlaceholder";

// Sample message data with English messages
const sampleMessages = [
    {
        id: 1,
        text: "Hey! How are you doing today?",
        sender: "received",
        timestamp: "2:28 pm",
        read: false
    },
    {
        id: 2,
        text: "I'm doing great, thanks! How about you?",
        sender: "sent",
        timestamp: "2:28 pm",
        read: true
    },
    {
        id: 3,
        text: "Pretty good! Just working on some new projects. What's new with you?",
        sender: "received",
        timestamp: "2:29 pm",
        read: false
    },
    {
        id: 4,
        text: "Same here, lots of coding lately. Are you free this weekend?",
        sender: "sent",
        timestamp: "2:29 pm",
        read: true
    },
    {
        id: 5,
        text: "Yes, I should be! What did you have in mind?",
        sender: "received",
        timestamp: "2:30 pm",
        read: false
    },
    {
        id: 6,
        text: "I was thinking we could grab some coffee and maybe check out that new bookstore downtown. I heard they have an amazing collection of programming books and some really cool tech magazines.",
        sender: "sent",
        timestamp: "2:31 pm",
        read: true
    },
    {
        id: 7,
        text: "That sounds perfect! I've been meaning to visit that place. What time were you thinking?",
        sender: "received",
        timestamp: "2:32 pm",
        read: false
    },
    {
        id: 8,
        text: "How about Saturday around 2 PM? We could meet at that café across the street first, then head to the bookstore. I also wanted to show you this new JavaScript framework I've been learning - it's really interesting how it handles state management differently than React.",
        sender: "sent",
        timestamp: "2:33 pm",
        read: true
    },
    {
        id: 9,
        text: "2 PM works great for me! And yes, I'd love to hear about that framework. I've been looking into some new technologies myself. Have you heard about the latest updates to TypeScript? The new features are pretty impressive.",
        sender: "received",
        timestamp: "2:34 pm",
        read: false
    },
    {
        id: 10,
        text: "Oh yes! The new utility types are game-changers. I've been refactoring some of my old projects to use them. 😊",
        sender: "sent",
        timestamp: "2:35 pm",
        read: true
    },
    {
        id: 11,
        text: "Awesome! I can't wait to discuss all this in person. It's so much better to talk about code when you can actually see what the other person is working on. Plus, I have some questions about your recent GitHub projects.",
        sender: "received",
        timestamp: "2:36 pm",
        read: false
    },
    {
        id: 12,
        text: "Perfect! I'll bring my laptop so we can do some pair programming if you want. It's always more fun to code together.",
        sender: "sent",
        timestamp: "2:37 pm",
        read: true
    },
    {
        id: 13,
        text: "That would be amazing! I've been stuck on this one bug for days and could really use a fresh pair of eyes. See you Saturday!",
        sender: "received",
        timestamp: "2:38 pm",
        read: false
    },
    {
        id: 14,
        text: "Looking forward to it! 👍",
        sender: "sent",
        timestamp: "2:38 pm",
        read: true
    }
];

function ChatArea() {
    const { selectedChat } = useSelector((state) => state?.user);
    const { room } = useSelector((state) => state?.room);
    const [messages, setMessages] = useState(sampleMessages);
    const [newMessage, setNewMessage] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const messagesEndRef = useRef(null);

    const hasActiveUser =
        selectedChat && typeof selectedChat === "object" && Object.keys(selectedChat).length > 0;

    const hasActiveRoom =
        room && typeof room === "object" && Object.keys(room).length > 0;


    useEffect(() => {
        if (!hasActiveUser || !hasActiveRoom) {
            setMessages(sampleMessages);
            setNewMessage("");
        }
    }, [hasActiveUser, hasActiveRoom]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            const message = {
                id: messages.length + 1,
                text: newMessage,
                sender: "sent",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                read: false
            };
            setMessages([...messages, message]);
            setNewMessage('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    if (!hasActiveUser || !hasActiveRoom) {
        return <ChatPlaceholder />;
    }

    return (
        <div className="flex flex-col h-screen bg-[#0b141a] relative">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 bg-[#161717] border-b border-[#303d45]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                        <img
                            src="https://png.pngtree.com/png-clipart/20230927/original/pngtree-man-avatar-image-for-profile-png-image_13001877.png"
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div>
                        <h3 className="text-white font-medium text-[1rem]">John Doe</h3>
                        <p className="text-[#8696a0] text-[0.8rem]">online</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button className="text-white hover:text-[#8696a0] transition-colors">
                        <MdVideoCall className="text-[1.5rem]" />
                    </button>
                    <button className="text-white hover:text-[#8696a0] transition-colors">
                        <MdCall className="text-[1.5rem]" />
                    </button>
                    <button className="text-white hover:text-[#8696a0] transition-colors">
                        <MdSearch className="text-[1.5rem]" />
                    </button>
                    <button className="text-white hover:text-[#8696a0] transition-colors">
                        <MdMoreVert className="text-[1.5rem]" />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 relative chat-scrollbar" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundRepeat: 'repeat'
            }}>
                <div className="space-y-2">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.sender === 'sent' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[70%] px-3 py-2 rounded-lg relative message-bubble ${message.sender === 'sent'
                                    ? 'bg-[#144d37] text-white'
                                    : 'bg-[#242626] text-white'
                                    }`}
                                style={{
                                    borderRadius: message.sender === 'sent'
                                        ? '18px 18px 4px 18px'
                                        : '18px 18px 18px 4px'
                                }}
                            >
                                <p className="text-[0.9rem] leading-relaxed break-words">
                                    {message.text}
                                </p>
                                <div className={`flex items-center gap-1 mt-1 ${message.sender === 'sent' ? 'justify-end' : 'justify-start'
                                    }`}>
                                    <span className="text-[0.7rem] text-[#8696a0]">
                                        {message.timestamp}
                                    </span>
                                    {message.sender === 'sent' && (
                                        <div className="ml-1">
                                            {message.read ? (
                                                <FaCheckDouble className="text-[0.7rem] text-[#53bdeb]" />
                                            ) : (
                                                <FaCheck className="text-[0.7rem] text-[#8696a0]" />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Message Input Area */}
            <div className="p-4">
                <div className="flex items-center gap-3">
                    <button className="text-white hover:text-[#8696a0] transition-colors">
                        <MdAttachFile className="text-[1.5rem]" />
                    </button>

                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type a message"
                            className="w-full bg-[#242626] text-white px-4 py-3 rounded-full border-none outline-none placeholder-[#8696a0] text-[0.9rem]"
                        />
                        <button
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white hover:text-[#8696a0] transition-colors"
                        >
                            <BsEmojiSmile className="text-[1.3rem]" />
                        </button>
                    </div>

                    <button className="text-white hover:text-[#8696a0] transition-colors">
                        <MdMic className="text-[1.5rem]" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ChatArea;
