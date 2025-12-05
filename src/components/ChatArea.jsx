import React, { useState, useRef, useEffect } from "react";
import { IoMdSend } from "react-icons/io";
import { BsEmojiSmile } from "react-icons/bs";
import { MdAttachFile, MdMoreVert, MdCall, MdVideoCall, MdSearch, MdMic } from "react-icons/md";
import { FaCheck, FaCheckDouble } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import ChatPlaceholder from "./ChatPlaceholder";
import useMessages from "../hooks/useMessages";
import useSocket from "../hooks/useSocket";

function ChatArea() {
    const { selectedChat, user } = useSelector((state) => state?.user);
    const { room } = useSelector((state) => state?.room);

    console.log(room, "room for chat area");
    const { messages, isLoading, error, hasMore, loadMore, isLoadingMore, refresh, markAsRead } = useMessages(room?._id, 20);
    const [newMessage, setNewMessage] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [typingUsers, setTypingUsers] = useState(new Set());
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const socket = useSocket();
    const queryClient = useQueryClient();

    const hasActiveUser =
        selectedChat && typeof selectedChat === "object" && Object.keys(selectedChat).length > 0;

    const hasActiveRoom =
        room && typeof room === "object" && Object.keys(room).length > 0;

    // Cleanup typing timeout on unmount or room change
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            // Emit typing stop when leaving room
            if (isTyping && socket && room?._id && user?._id) {
                socket.emit("typing:stop", {
                    roomId: room._id,
                    userId: user._id
                });
            }
        };
    }, [room?._id]);

    // Mark messages as read when room opens
    useEffect(() => {
        if (hasActiveRoom && room?._id && messages.length > 0) {
            markAsRead();
        }
    }, [room?._id]);

    // Listen for incoming messages via Socket.IO
    useEffect(() => {
        if (!socket || !room?._id) {
            console.log("⚠️ Socket listener not active:", { socket: !!socket, roomId: room?._id });
            return;
        }

        console.log("👂 Setting up socket listener for room:", room._id);

        const handleNewMessage = (data) => {
            console.log("📩 Received new message event:", data);

            if (data.success && data.message) {
                console.log("✅ Processing message:", data.message._id);

                // Update React Query cache with new message
                queryClient.setQueryData(["messages", room._id], (oldData) => {
                    console.log("📦 Current cache state:", oldData ? "exists" : "empty");

                    if (!oldData) {
                        console.log("⚠️ No cache data, skipping update");
                        return oldData;
                    }

                    // Check if message already exists (avoid duplicates)
                    const messageExists = oldData?.pages?.some(page =>
                        page?.messages?.some(msg => msg?._id === data?.message?._id)
                    );

                    if (messageExists) {
                        console.log("⚠️ Message already exists, skipping");
                        return oldData;
                    }

                    // Add new message to the first page
                    const newPages = [...(oldData?.pages ?? [])];
                    if (newPages?.length > 0) {
                        newPages[0] = {
                            ...newPages[0],
                            messages: [...(newPages[0]?.messages ?? []), data?.message]
                        };
                        console.log("✅ Message added to cache, total messages:", newPages[0]?.messages?.length);
                    }

                    return {
                        ...oldData,
                        pages: newPages
                    };
                });

                // Scroll to bottom for new messages
                setTimeout(() => {
                    scrollToBottom();
                }, 100);

                // Mark as read if room is open
                if (data.message.sender?._id !== user?._id) {
                    console.log("👁️ Marking message as read");
                    markAsRead();
                }
            } else {
                console.log("⚠️ Invalid message data:", data);
            }
        };

        socket.on("chat:message:receive", handleNewMessage);
        console.log("✅ Socket listener attached for chat:message:receive");

        return () => {
            console.log("🔴 Removing socket listener for room:", room._id);
            socket.off("chat:message:receive", handleNewMessage);
        };
    }, [socket, room?._id, queryClient, user?._id]);

    // Listen for typing indicators
    useEffect(() => {
        if (!socket || !room?._id) return;

        const handleTypingStart = (data) => {
            console.log("⌨️ User started typing:", data);
            if (data.userId && data.userId !== user?._id) {
                setTypingUsers(prev => new Set(prev).add(data.userId));
                // Scroll to show typing indicator
                setTimeout(() => scrollToBottom(), 100);
            }
        };

        const handleTypingStop = (data) => {
            console.log("⌨️ User stopped typing:", data);
            if (data.userId) {
                setTypingUsers(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(data.userId);
                    return newSet;
                });
            }
        };

        socket.on("typing:start", handleTypingStart);
        socket.on("typing:stop", handleTypingStop);

        return () => {
            socket.off("typing:start", handleTypingStart);
            socket.off("typing:stop", handleTypingStop);
        };
    }, [socket, room?._id, user?._id]);

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
        if (!newMessage.trim() || !socket || !room?._id || !user?._id || isSending) {
            console.log("⚠️ Cannot send message:", {
                hasContent: !!newMessage.trim(),
                hasSocket: !!socket,
                socketConnected: socket?.connected,
                hasRoomId: !!room?._id,
                hasUserId: !!user?._id,
                isSending
            });
            return;
        }

        const messageContent = newMessage.trim();
        const tempId = `temp-${Date.now()}-${Math.random()}`;

        console.log("📤 Sending message:", {
            roomId: room._id,
            content: messageContent,
            senderId: user._id,
            tempId
        });

        setIsSending(true);

        // Emit message via Socket.IO
        socket.emit(
            "chat:message",
            {
                roomId: room._id,
                content: messageContent,
                senderId: user._id,
                receiverId: selectedChat?._id,
                tempId,
                type: "text"
            },
            (response) => {
                setIsSending(false);
                console.log("📬 Received acknowledgment:", response);

                    if (response?.success) {
                        console.log("✅ Message sent successfully:", response?.message?._id);
                    setNewMessage("");

                    // Stop typing indicator when message is sent
                    if (isTyping) {
                        setIsTyping(false);
                        socket.emit("typing:stop", {
                            roomId: room._id,
                            userId: user._id
                        });
                        if (typingTimeoutRef.current) {
                            clearTimeout(typingTimeoutRef.current);
                        }
                    }
                } else {
                    console.error("❌ Failed to send message:", response?.error);
                    alert(`Failed to send message: ${response?.error || "Unknown error"}`);
                }
            }
        );
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Handle typing indicator
    const handleTyping = () => {
        if (!socket || !room?._id || !user?._id) return;

        // Emit typing start if not already typing
        if (!isTyping) {
            setIsTyping(true);
            socket.emit("typing:start", {
                roomId: room._id,
                userId: user._id,
                userName: user.name || user.email
            });
            console.log("⌨️ Emitted typing:start");
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set timeout to emit typing stop after 2 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            socket.emit("typing:stop", {
                roomId: room._id,
                userId: user._id
            });
            console.log("⌨️ Emitted typing:stop");
        }, 2000);
    };

    // Handle input change with typing indicator
    const handleInputChange = (e) => {
        setNewMessage(e.target.value);
        handleTyping();
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

                    {/* Typing Indicator */}
                    {typingUsers.size > 0 && (
                        <div className="flex justify-start">
                            <div
                                className="max-w-[70%] px-4 py-3 rounded-lg bg-[#242626] text-white"
                                style={{ borderRadius: "18px 18px 18px 4px" }}
                            >
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-1">
                                        <span
                                            className="w-2 h-2 bg-[#8696a0] rounded-full animate-bounce"
                                            style={{ animationDelay: "0ms", animationDuration: "1s" }}
                                        ></span>
                                        <span
                                            className="w-2 h-2 bg-[#8696a0] rounded-full animate-bounce"
                                            style={{ animationDelay: "150ms", animationDuration: "1s" }}
                                        ></span>
                                        <span
                                            className="w-2 h-2 bg-[#8696a0] rounded-full animate-bounce"
                                            style={{ animationDelay: "300ms", animationDuration: "1s" }}
                                        ></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Empty state */}
                {messages.length === 0 && !isLoading && (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center max-w-md px-6">
                            {/* Icon/Illustration */}
                            <div className="mb-6 flex justify-center">
                                <div className="w-32 h-32 rounded-full bg-[#1f2c33] flex items-center justify-center border-2 border-[#2a3942]">
                                    <svg
                                        className="w-16 h-16 text-[#8696a0]"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                        />
                                    </svg>
                                </div>
                            </div>

                            {/* Text content */}
                            <h3 className="text-white text-xl font-medium mb-2">
                                No messages yet
                            </h3>
                            <p className="text-[#8696a0] text-sm mb-6 leading-relaxed">
                                Send a message to start the conversation with{" "}
                                <span className="text-[#00a884] font-medium">
                                    {room?.type === "group" ? room?.name : selectedChat?.name}
                                </span>
                            </p>

                            {/* Decorative elements */}
                            <div className="flex justify-center gap-2 opacity-50">
                                <div className="w-2 h-2 rounded-full bg-[#8696a0]"></div>
                                <div className="w-2 h-2 rounded-full bg-[#8696a0]"></div>
                                <div className="w-2 h-2 rounded-full bg-[#8696a0]"></div>
                            </div>
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
                            onChange={handleInputChange}
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
                            disabled={isSending}
                            className={`transition-colors ${isSending
                                ? "text-gray-500 cursor-not-allowed"
                                : "text-[#00a884] hover:text-[#00c89d]"
                                }`}
                        >
                            {isSending ? (
                                <svg
                                    className="animate-spin h-6 w-6"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                            ) : (
                                <IoMdSend className="text-[1.5rem]" />
                            )}
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
