import React, { useState, useEffect } from "react";
import { MdSearch, MdPersonAdd, MdCheck, MdHourglassEmpty, MdArrowBack, MdPeople, MdHome } from "react-icons/md";
import { HiSparkles, HiUserGroup, HiGlobeAlt, HiHeart } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import { useDiscoverUsers, useConnectionMutations } from "../hooks/useConnections";
import useSocket from "../hooks/useSocket";

// Decorative floating icon component
const FloatingIcon = ({ icon: Icon, className, delay = 0 }) => (
    <div
        className={`absolute opacity-10 ${className}`}
        style={{
            animation: `float 6s ease-in-out infinite`,
            animationDelay: `${delay}s`
        }}
    >
        <Icon className="text-[#00a884]" />
    </div>
);

// User Card Component
const UserCard = ({ user, onConnect, onCancel, onNavigate, isLoading }) => {
    const getStatusContent = () => {
        if (user.connectionStatus === "accepted") {
            return (
                <button
                    className="w-full py-2.5 bg-gradient-to-r from-[#00a884]/20 to-[#00d4a4]/20 text-[#00a884] rounded-xl text-sm font-medium border border-[#00a884]/30 flex items-center justify-center gap-2"
                    onClick={() => onNavigate("/home")}
                >
                    <MdCheck className="text-lg" />
                    <span>Connected</span>
                </button>
            );
        }

        if (user.connectionStatus === "pending") {
            if (user.connectionDirection === "sent") {
                return (
                    <button
                        onClick={() => onCancel(user.connection._id)}
                        disabled={isLoading}
                        className="w-full py-2.5 bg-[#2a3942] text-[#8696a0] rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#f15c6d]/20 hover:text-[#f15c6d] transition-colors group"
                        title="Click to cancel request"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Request Sent</span>
                    </button>
                );
            } else {
                return (
                    <button
                        onClick={() => onNavigate("/requests")}
                        className="w-full py-2.5 bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 shadow-lg shadow-[#f59e0b]/20"
                    >
                        <HiSparkles className="text-lg" />
                        <span>Respond</span>
                    </button>
                );
            }
        }

        return (
            <button
                onClick={() => onConnect(user._id)}
                disabled={isLoading}
                className="w-full py-2.5 bg-gradient-to-r from-[#00a884] to-[#00d4a4] text-white rounded-xl text-sm font-medium shadow-lg shadow-[#00a884]/20 hover:shadow-[#00a884]/40 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
            >
                <MdPersonAdd className="text-lg" />
                <span>Connect</span>
            </button>
        );
    };

    return (
        <div className="bg-[#111b21] rounded-2xl p-5 border border-[#2a3942] hover:border-[#00a884]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#00a884]/5 group">
            {/* Profile Section */}
            <div className="flex flex-col items-center text-center mb-4">
                <div className="relative mb-3">
                    <div className="w-20 h-20 rounded-full overflow-hidden ring-3 ring-[#2a3942] group-hover:ring-[#00a884]/50 transition-all duration-300">
                        <img
                            src={
                                user.profilePicture ||
                                "https://png.pngtree.com/png-clipart/20230927/original/pngtree-man-avatar-image-for-profile-png-image_13001877.png"
                            }
                            alt={user.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    {user.isOnline && (
                        <div className="absolute bottom-1 right-1 w-4 h-4 bg-[#00a884] rounded-full border-2 border-[#111b21]"></div>
                    )}
                </div>
                <h3 className="text-white font-semibold text-base truncate w-full">
                    {user.name}
                </h3>
                <p className="text-[#8696a0] text-sm truncate w-full">{user.email}</p>
            </div>

            {/* Action Button */}
            {getStatusContent()}
        </div>
    );
};

// Loading skeleton
const UserCardSkeleton = () => (
    <div className="bg-[#111b21] rounded-2xl p-5 border border-[#2a3942] animate-pulse">
        <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-[#2a3942] mb-3"></div>
            <div className="h-4 w-24 bg-[#2a3942] rounded-lg mb-2"></div>
            <div className="h-3 w-32 bg-[#2a3942] rounded-lg mb-4"></div>
            <div className="h-10 w-full bg-[#2a3942] rounded-xl"></div>
        </div>
    </div>
);

function UsersPage() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(1);
    const [searchFocused, setSearchFocused] = useState(false);

    const socket = useSocket();
    const { data, isLoading, error } = useDiscoverUsers(page, 20, debouncedSearch);
    const { sendRequest, cancelRequest } = useConnectionMutations();

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSendRequest = async (userId) => {
        try {
            const result = await sendRequest.mutateAsync({ recipientId: userId });
            if (socket && result.success) {
                socket.emit("connection:request", {
                    recipientId: userId,
                    request: result.data,
                });
            }
        } catch (error) {
            console.error("Failed to send request:", error);
        }
    };

    const handleCancelRequest = async (connectionId) => {
        try {
            await cancelRequest.mutateAsync(connectionId);
        } catch (error) {
            console.error("Failed to cancel request:", error);
        }
    };

    const totalUsers = data?.pagination?.total || 0;

    return (
        <div className="min-h-screen bg-[#0b141a] relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <FloatingIcon icon={HiUserGroup} className="text-6xl top-20 left-[10%]" delay={0} />
                <FloatingIcon icon={HiGlobeAlt} className="text-8xl top-40 right-[15%]" delay={1} />
                <FloatingIcon icon={HiHeart} className="text-5xl bottom-40 left-[20%]" delay={2} />
                <FloatingIcon icon={HiSparkles} className="text-7xl bottom-20 right-[10%]" delay={0.5} />
                <FloatingIcon icon={MdPeople} className="text-6xl top-1/2 left-[5%]" delay={1.5} />

                {/* Gradient orbs */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#00a884]/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#00d4a4]/5 rounded-full blur-3xl"></div>
            </div>

            {/* Content Container */}
            <div className="relative max-w-4xl mx-auto px-4 py-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate("/home")}
                        className="p-2.5 rounded-xl bg-[#111b21] text-[#aebac1] hover:text-white hover:bg-[#202c33] transition-all duration-200 border border-[#2a3942]"
                    >
                        <MdArrowBack className="text-xl" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-white text-2xl font-bold tracking-tight">Discover People</h1>
                        <p className="text-[#8696a0] text-sm">Find and connect with new friends</p>
                    </div>
                    <button
                        onClick={() => navigate("/requests")}
                        className="p-2.5 rounded-xl bg-[#111b21] text-[#aebac1] hover:text-[#00a884] hover:bg-[#202c33] transition-all duration-200 border border-[#2a3942]"
                        title="Requests"
                    >
                        <MdPeople className="text-xl" />
                    </button>
                    <button
                        onClick={() => navigate("/home")}
                        className="p-2.5 rounded-xl bg-[#111b21] text-[#aebac1] hover:text-[#00a884] hover:bg-[#202c33] transition-all duration-200 border border-[#2a3942]"
                        title="Home"
                    >
                        <MdHome className="text-xl" />
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-gradient-to-br from-[#111b21] to-[#0b141a] rounded-xl p-4 border border-[#2a3942] text-center">
                        <div className="text-2xl font-bold text-white">{totalUsers}</div>
                        <div className="text-xs text-[#8696a0]">People to discover</div>
                    </div>
                    <div className="bg-gradient-to-br from-[#111b21] to-[#0b141a] rounded-xl p-4 border border-[#2a3942] text-center">
                        <div className="text-2xl font-bold text-[#00a884]">
                            <HiUserGroup className="inline" />
                        </div>
                        <div className="text-xs text-[#8696a0]">Build your network</div>
                    </div>
                    <div className="bg-gradient-to-br from-[#111b21] to-[#0b141a] rounded-xl p-4 border border-[#2a3942] text-center">
                        <div className="text-2xl font-bold text-[#00a884]">
                            <HiSparkles className="inline" />
                        </div>
                        <div className="text-xs text-[#8696a0]">Start chatting</div>
                    </div>
                </div>

                {/* Search */}
                <div className={`relative mb-6 transition-all duration-300 ${searchFocused ? 'scale-[1.01]' : ''}`}>
                    <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-[#00a884]/20 to-[#00d4a4]/20 blur-xl transition-opacity duration-300 ${searchFocused ? 'opacity-100' : 'opacity-0'}`}></div>
                    <div className="relative">
                        <MdSearch className={`absolute left-4 top-1/2 transform -translate-y-1/2 text-xl transition-colors duration-300 ${searchFocused ? 'text-[#00a884]' : 'text-[#8696a0]'}`} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setSearchFocused(true)}
                            onBlur={() => setSearchFocused(false)}
                            className={`w-full bg-[#111b21] text-white pl-12 pr-4 py-4 rounded-xl outline-none placeholder-[#8696a0] border-2 transition-all duration-300 ${searchFocused ? 'border-[#00a884]/50' : 'border-[#2a3942]'}`}
                        />
                    </div>
                </div>

                {/* Users Grid */}
                {isLoading && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => (
                            <UserCardSkeleton key={i} />
                        ))}
                    </div>
                )}

                {error && (
                    <div className="bg-[#111b21] rounded-2xl p-12 border border-[#2a3942] text-center">
                        <div className="w-20 h-20 rounded-full bg-[#f15c6d]/10 flex items-center justify-center mx-auto mb-4">
                            <span className="text-4xl">😕</span>
                        </div>
                        <p className="text-white text-lg font-medium mb-2">Oops! Something went wrong</p>
                        <p className="text-[#8696a0] text-sm">Failed to load users. Please try again.</p>
                    </div>
                )}

                {data?.data?.length === 0 && !isLoading && (
                    <div className="bg-[#111b21] rounded-2xl p-12 border border-[#2a3942] text-center">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#202c33] to-[#1a252c] flex items-center justify-center mx-auto mb-4">
                            <MdSearch className="text-5xl text-[#8696a0]" />
                        </div>
                        <p className="text-white text-lg font-medium mb-2">No users found</p>
                        <p className="text-[#8696a0] text-sm max-w-xs mx-auto">
                            Try searching with a different name or email address
                        </p>
                    </div>
                )}

                {data?.data?.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {data.data.map((user, index) => (
                            <div
                                key={user._id}
                                className="animate-fadeIn"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <UserCard
                                    user={user}
                                    onConnect={handleSendRequest}
                                    onCancel={handleCancelRequest}
                                    onNavigate={navigate}
                                    isLoading={sendRequest.isLoading || cancelRequest.isLoading}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {data?.pagination?.totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-8">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 bg-[#111b21] text-white rounded-lg border border-[#2a3942] disabled:opacity-40 hover:bg-[#202c33] transition-all"
                        >
                            Previous
                        </button>
                        <div className="flex items-center gap-1">
                            {[...Array(Math.min(5, data.pagination.totalPages))].map((_, i) => {
                                const pageNum = i + 1;
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setPage(pageNum)}
                                        className={`w-9 h-9 rounded-lg font-medium transition-all ${page === pageNum
                                            ? 'bg-[#00a884] text-white'
                                            : 'bg-[#111b21] text-[#8696a0] hover:bg-[#202c33] border border-[#2a3942]'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                            disabled={page === data.pagination.totalPages}
                            className="px-4 py-2 bg-[#111b21] text-white rounded-lg border border-[#2a3942] disabled:opacity-40 hover:bg-[#202c33] transition-all"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Custom Styles */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(5deg); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(15px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out forwards;
                    opacity: 0;
                }
            `}</style>
        </div>
    );
}

export default UsersPage;
