import React, { useState, useRef, useEffect } from "react";
import { IoMdSend } from "react-icons/io";
import { BsEmojiSmile } from "react-icons/bs";
import { MdAttachFile, MdMoreVert, MdCall, MdVideoCall, MdSearch, MdMic } from "react-icons/md";
import { FaCheck, FaCheckDouble } from "react-icons/fa";
import { useSelector } from "react-redux";
import ChatPlaceholder from "./ChatPlaceholder";
import useMessages from "../hooks/useMessages";

function ChatArea() {
    const { selectedChat, user } = useSelector((state) => state?.user);
    const { room } = useSelector((state) => state?.room);
    const { messages, isLoading, error, hasMore, loadMore, isLoadingMore, refresh, markAsRead } = useMessages(room?._id, 20);
    const [newMessage, setNewMessage] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);

    const hasActiveUser =
        selectedChat && typeof selectedChat === "object" && Object.keys(selectedChat).length > 0;

    const hasActiveRoom =
        room && typeof room === "object" && Object.keys(room).length > 0;

    // Mark messages as read when room opens
    useEffect(() => {
        if (hasActiveRoom && room?._id && messages.length > 0) {
            markAsRead();
        }
    }, [room?._id]);

    // Scroll to bottom on initial room load
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (messages.length > 0 && !isLoading) {
            scrollToBottom();
        }
    }, [room?._id]);

    // Handle scroll for infinite scroll (load more at top)
    const handleScroll = () => {
        const container = messagesContainerRef.current;
        if (!container) return;

        // Check if scrolled to top
        if (container.scrollTop === 0 && hasMore && !isLoadingMore) {
            const previousScrollHeight = container.scrollHeight;
            const previousScrollTop = container.scrollTop;

            loadMore().then(() => {
                // Maintain scroll position after loading older messages
                requestAnimationFrame(() => {
                    const newScrollHeight = container.scrollHeight;
                    container.scrollTop = newScrollHeight - previousScrollHeight + previousScrollTop;
                });
            });
        }
    };

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            setNewMessage("");
            // After sending via socket, the message will come back via real-time updates
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    if (!hasActiveUser || !hasActiveRoom) {
        return <ChatPlaceholder />;
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#0b141a]">
                <div className="text-white text-lg">Loading messages...</div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-[#0b141a]">
                <div className="text-red-500 text-lg mb-4">Failed to load messages</div>
                <button
                    onClick={() => refresh()}
                    className="px-4 py-2 bg-[#144d37] text-white rounded-lg hover:bg-[#1a6043] transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-[#0b141a] relative">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 bg-[#161717] border-b border-[#303d45]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                        <img
                            src={
                                selectedChat?.profilePicture ||
                                "https://png.pngtree.com/png-clipart/20230927/original/pngtree-man-avatar-image-for-profile-png-image_13001877.png"
                            }
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div>
                        <h3 className="text-white font-medium text-[1rem]">
                            {room?.type === "group" ? room?.name : selectedChat?.name || "Unknown User"}
                        </h3>
                        <p className="text-[#8696a0] text-[0.8rem]">
                            {room?.type === "group"
                                ? `${room?.participants?.length || 0} participants`
                                : selectedChat?.online
                                    ? "online"
                                    : "offline"}
                        </p>
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
            <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 relative chat-scrollbar"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundRepeat: "repeat",
                }}
            >
                {/* Loading more indicator at top */}
                {isLoadingMore && (
                    <div className="flex justify-center mb-4">
                        <div className="text-[#8696a0] text-sm bg-[#242626] px-3 py-1 rounded-full">
                            Loading older messages...
                        </div>
                    </div>
                )}

                {/* Show "No more messages" if at the end */}
                {!hasMore && messages.length > 0 && (
                    <div className="flex justify-center mb-4">
                        <div className="text-[#8696a0] text-xs px-3 py-1 bg-[#242626] rounded-full">
                            Beginning of conversation
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    {messages.map((message) => {
                        // Determine if message is sent by current user
                        const isSentByMe = user?._id === message.sender?._id;

                        return (
                            <div
                                key={message._id}
                                className={`flex ${isSentByMe ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[70%] px-3 py-2 rounded-lg relative message-bubble ${isSentByMe
                                        ? "bg-[#144d37] text-white"
                                        : "bg-[#242626] text-white"
                                        }`}
                                    style={{
                                        borderRadius: isSentByMe
                                            ? "18px 18px 4px 18px"
                                            : "18px 18px 18px 4px",
                                    }}
                                >
                                    {/* Show sender name in group chats */}
                                    {room?.type === "group" && !isSentByMe && (
                                        <p className="text-[#8696a0] text-[0.75rem] mb-1 font-medium">
                                            {message.sender?.name}
                                        </p>
                                    )}

                                    <p className="text-[0.9rem] leading-relaxed break-words">
                                        {message.content}
                                    </p>

                                    <div
                                        className={`flex items-center gap-1 mt-1 ${isSentByMe ? "justify-end" : "justify-start"
                                            }`}
                                    >
                                        <span className="text-[0.7rem] text-[#8696a0]">
                                            {new Date(message.createdAt).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                        {isSentByMe && (
                                            <div className="ml-1">
                                                {message.status === "read" ? (
                                                    <FaCheckDouble className="text-[0.7rem] text-[#53bdeb]" />
                                                ) : message.status === "delivered" ? (
                                                    <FaCheckDouble className="text-[0.7rem] text-[#8696a0]" />
                                                ) : (
                                                    <FaCheck className="text-[0.7rem] text-[#8696a0]" />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Empty state */}
                {messages.length === 0 && !isLoading && (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-[#8696a0] text-center">
                            <p className="text-lg mb-2">No messages yet</p>
                            <p className="text-sm">Start the conversation!</p>
                        </div>
                    </div>
                )}
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

                    {newMessage.trim() ? (
                        <button
                            onClick={handleSendMessage}
                            className="text-[#00a884] hover:text-[#00c89d] transition-colors"
                        >
                            <IoMdSend className="text-[1.5rem]" />
                        </button>
                    ) : (
                        <button className="text-white hover:text-[#8696a0] transition-colors">
                            <MdMic className="text-[1.5rem]" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ChatArea;
