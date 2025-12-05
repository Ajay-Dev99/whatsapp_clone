import React, { useState, useEffect } from "react";
import { MdArrowBack, MdCheck, MdClose, MdInbox, MdSend, MdExplore, MdHome } from "react-icons/md";
import { HiSparkles, HiUserPlus, HiHeart, HiBell, HiPaperAirplane } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import { useReceivedRequests, useSentRequests, useConnectionMutations } from "../hooks/useConnections";
import useSocket from "../hooks/useSocket";
import { useQueryClient } from "@tanstack/react-query";

// Decorative floating icon
const FloatingIcon = ({ icon: Icon, className, delay = 0 }) => (
    <div
        className={`absolute opacity-10 ${className}`}
        style={{ animation: `float 6s ease-in-out infinite`, animationDelay: `${delay}s` }}
    >
        <Icon className="text-[#00a884]" />
    </div>
);

// Request Card Component
const RequestCard = ({ request, type, onAccept, onReject, onCancel, isLoading, formatDate }) => {
    const user = type === "received" ? request.requester : request.recipient;

    return (
        <div className="bg-[#111b21] rounded-2xl p-5 border border-[#2a3942] hover:border-[#00a884]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#00a884]/5 group">
            {/* Profile Section */}
            <div className="flex flex-col items-center text-center mb-4">
                <div className="relative mb-3">
                    <div className="w-20 h-20 rounded-full overflow-hidden ring-3 ring-[#2a3942] group-hover:ring-[#00a884]/50 transition-all duration-300">
                        <img
                            src={
                                user?.profilePicture ||
                                "https://png.pngtree.com/png-clipart/20230927/original/pngtree-man-avatar-image-for-profile-png-image_13001877.png"
                            }
                            alt={user?.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    {type === "received" && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-[#00a884] to-[#00d4a4] rounded-full flex items-center justify-center shadow-lg">
                            <HiSparkles className="text-white text-xs" />
                        </div>
                    )}
                </div>
                <h3 className="text-white font-semibold text-base truncate w-full">
                    {user?.name}
                </h3>
                <p className="text-[#8696a0] text-xs mt-1">{formatDate(request.createdAt)}</p>
                {request.message && (
                    <p className="text-[#aebac1] text-xs mt-2 italic bg-[#0b141a]/50 px-3 py-1.5 rounded-lg">
                        "{request.message}"
                    </p>
                )}
            </div>

            {/* Action Buttons */}
            {type === "received" ? (
                <div className="flex gap-2">
                    <button
                        onClick={() => onAccept(request?._id, request?.requester?._id)}
                        disabled={isLoading}
                        className="flex-1 py-2.5 bg-gradient-to-r from-[#00a884] to-[#00d4a4] text-white rounded-xl text-sm font-medium hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                        <MdCheck className="text-lg" />
                        <span>Accept</span>
                    </button>
                    <button
                        onClick={() => onReject(request?._id, request?.requester?._id)}
                        disabled={isLoading}
                        className="flex-1 py-2.5 bg-[#2a3942] text-[#8696a0] rounded-xl text-sm font-medium hover:bg-[#f15c6d] hover:text-white transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                        <MdClose className="text-lg" />
                        <span>Decline</span>
                    </button>
                </div>
            ) : (
                <div className="space-y-2">
                    {/* Status Badge */}
                    <div className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-[#00a884]/10 text-[#00a884] rounded-lg text-xs font-medium">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Awaiting response</span>
                    </div>
                    <button
                        onClick={() => onCancel(request?._id)}
                        disabled={isLoading}
                        className="w-full py-2 bg-[#2a3942] text-[#8696a0] rounded-xl text-sm font-medium hover:bg-[#f15c6d]/20 hover:text-[#f15c6d] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <MdClose className="text-lg" />
                        <span>Cancel</span>
                    </button>
                </div>
            )}
        </div>
    );
};

// Loading skeleton
const CardSkeleton = () => (
    <div className="bg-[#111b21] rounded-2xl p-5 border border-[#2a3942] animate-pulse">
        <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-[#2a3942] mb-3"></div>
            <div className="h-4 w-24 bg-[#2a3942] rounded-lg mb-2"></div>
            <div className="h-3 w-16 bg-[#2a3942] rounded-lg mb-4"></div>
            <div className="flex gap-2 w-full">
                <div className="h-10 flex-1 bg-[#2a3942] rounded-xl"></div>
                <div className="h-10 flex-1 bg-[#2a3942] rounded-xl"></div>
            </div>
        </div>
    </div>
);

function RequestsPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("received");
    const queryClient = useQueryClient();
    const socket = useSocket();

    const { data: receivedRequests, isLoading: receivedLoading } = useReceivedRequests();
    const { data: sentRequests, isLoading: sentLoading } = useSentRequests();
    const { acceptRequest, rejectRequest, cancelRequest } = useConnectionMutations();

    useEffect(() => {
        if (!socket) return;

        const handleNewRequest = () => queryClient.invalidateQueries(["connections", "received"]);
        const handleRequestAccepted = () => queryClient.invalidateQueries(["connections"]);

        socket.on("connection:request:received", handleNewRequest);
        socket.on("connection:accepted", handleRequestAccepted);
        socket.on("connection:rejected", () => queryClient.invalidateQueries(["connections", "sent"]));

        return () => {
            socket.off("connection:request:received", handleNewRequest);
            socket.off("connection:accepted", handleRequestAccepted);
            socket.off("connection:rejected");
        };
    }, [socket, queryClient]);

    const handleAccept = async (connectionId, requesterId) => {
        try {
            const result = await acceptRequest.mutateAsync(connectionId);
            if (socket && result.success) {
                socket.emit("connection:accepted", { requesterId, connection: result.data });
            }
        } catch (error) {
            console.error("Failed to accept request:", error);
        }
    };

    const handleReject = async (connectionId, requesterId) => {
        try {
            await rejectRequest.mutateAsync(connectionId);
            if (socket) {
                socket.emit("connection:rejected", { requesterId, connectionId });
            }
        } catch (error) {
            console.error("Failed to reject request:", error);
        }
    };

    const handleCancel = async (connectionId) => {
        try {
            await cancelRequest.mutateAsync(connectionId);
        } catch (error) {
            console.error("Failed to cancel request:", error);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const receivedCount = receivedRequests?.length || 0;
    const sentCount = sentRequests?.length || 0;
    const isLoading = activeTab === "received" ? receivedLoading : sentLoading;
    const requests = activeTab === "received" ? receivedRequests : sentRequests;

    return (
        <div className="min-h-screen bg-[#0b141a] relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <FloatingIcon icon={HiBell} className="text-6xl top-20 left-[10%]" delay={0} />
                <FloatingIcon icon={HiHeart} className="text-8xl top-40 right-[15%]" delay={1} />
                <FloatingIcon icon={HiPaperAirplane} className="text-5xl bottom-40 left-[20%]" delay={2} />
                <FloatingIcon icon={HiSparkles} className="text-7xl bottom-20 right-[10%]" delay={0.5} />

                {/* Gradient orbs */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#00a884]/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#00d4a4]/5 rounded-full blur-3xl"></div>
            </div>

            {/* Content Container */}
            <div className="relative max-w-4xl mx-auto px-4 py-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate("/home")}
                        className="p-2.5 rounded-xl bg-[#111b21] text-[#aebac1] hover:text-white hover:bg-[#202c33] transition-all duration-200 border border-[#2a3942]"
                    >
                        <MdArrowBack className="text-xl" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-white text-2xl font-bold tracking-tight">Requests</h1>
                        <p className="text-[#8696a0] text-sm">Manage your connection requests</p>
                    </div>
                    <button
                        onClick={() => navigate("/users")}
                        className="p-2.5 rounded-xl bg-[#111b21] text-[#aebac1] hover:text-[#00a884] hover:bg-[#202c33] transition-all duration-200 border border-[#2a3942]"
                        title="Discover People"
                    >
                        <MdExplore className="text-xl" />
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
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <button
                        onClick={() => setActiveTab("received")}
                        className={`rounded-xl p-4 border text-center transition-all duration-300 ${activeTab === "received"
                            ? "bg-gradient-to-br from-[#00a884]/20 to-[#00a884]/5 border-[#00a884]/50"
                            : "bg-[#111b21] border-[#2a3942] hover:border-[#00a884]/30"
                            }`}
                    >
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <MdInbox className={`text-2xl ${activeTab === "received" ? "text-[#00a884]" : "text-[#8696a0]"}`} />
                            {receivedCount > 0 && (
                                <span className="px-2 py-0.5 bg-[#00a884] text-white text-xs rounded-full font-bold">
                                    {receivedCount}
                                </span>
                            )}
                        </div>
                        <div className={`text-sm font-medium ${activeTab === "received" ? "text-white" : "text-[#8696a0]"}`}>
                            Received
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab("sent")}
                        className={`rounded-xl p-4 border text-center transition-all duration-300 ${activeTab === "sent"
                            ? "bg-gradient-to-br from-[#00a884]/20 to-[#00a884]/5 border-[#00a884]/50"
                            : "bg-[#111b21] border-[#2a3942] hover:border-[#00a884]/30"
                            }`}
                    >
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <MdSend className={`text-2xl ${activeTab === "sent" ? "text-[#00a884]" : "text-[#8696a0]"}`} />
                            {sentCount > 0 && (
                                <span className="px-2 py-0.5 bg-[#667781] text-white text-xs rounded-full font-bold">
                                    {sentCount}
                                </span>
                            )}
                        </div>
                        <div className={`text-sm font-medium ${activeTab === "sent" ? "text-white" : "text-[#8696a0]"}`}>
                            Sent
                        </div>
                    </button>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <CardSkeleton key={i} />
                        ))}
                    </div>
                )}

                {/* Empty States */}
                {!isLoading && requests?.length === 0 && (
                    <div className="bg-[#111b21] rounded-2xl p-12 border border-[#2a3942] text-center">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#202c33] to-[#1a252c] flex items-center justify-center mx-auto mb-4">
                            {activeTab === "received" ? (
                                <MdInbox className="text-5xl text-[#8696a0]" />
                            ) : (
                                <MdSend className="text-5xl text-[#8696a0]" />
                            )}
                        </div>
                        <p className="text-white text-lg font-medium mb-2">
                            {activeTab === "received" ? "No pending requests" : "No sent requests"}
                        </p>
                        <p className="text-[#8696a0] text-sm max-w-xs mx-auto mb-6">
                            {activeTab === "received"
                                ? "When someone wants to connect with you, their request will appear here"
                                : "Start connecting with people and your sent requests will appear here"
                            }
                        </p>
                        {activeTab === "sent" && (
                            <button
                                onClick={() => navigate("/users")}
                                className="px-6 py-3 bg-gradient-to-r from-[#00a884] to-[#00d4a4] text-white rounded-xl font-medium hover:shadow-lg hover:shadow-[#00a884]/30 transition-all duration-300 inline-flex items-center gap-2"
                            >
                                <HiUserPlus className="text-xl" />
                                <span>Find People</span>
                            </button>
                        )}
                    </div>
                )}

                {/* Requests Grid */}
                {!isLoading && requests?.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {requests.map((request, index) => (
                            <div
                                key={request._id}
                                className="animate-fadeIn"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <RequestCard
                                    request={request}
                                    type={activeTab}
                                    onAccept={handleAccept}
                                    onReject={handleReject}
                                    onCancel={handleCancel}
                                    isLoading={acceptRequest.isLoading || rejectRequest.isLoading || cancelRequest.isLoading}
                                    formatDate={formatDate}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* Find People Button */}
                <div className="mt-8">
                    <button
                        onClick={() => navigate("/users")}
                        className="w-full py-4 bg-[#111b21] border border-[#2a3942] text-white rounded-xl font-medium hover:border-[#00a884]/50 transition-all duration-300 flex items-center justify-center gap-3"
                    >
                        <HiUserPlus className="text-xl text-[#00a884]" />
                        <span>Discover More People</span>
                    </button>
                </div>
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

export default RequestsPage;
