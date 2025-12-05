import { useEffect, useMemo } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

const useSocket = () => {
    const { user, selectedChat } = useSelector((state) => state?.user ?? {});
    const { room } = useSelector((state) => state?.room ?? {});

    const socket = useMemo(() => {
        return io(SOCKET_URL, {
            autoConnect: false,
            transports: ["websocket", "polling"],
        });
    }, []);

    useEffect(() => {
        if (!user) {
            socket.disconnect();
            return;
        }

        socket.auth = {
            userId: user.id || user._id,
            email: user.email,
        };

        socket.connect();

        // Add connection event listeners for debugging
        socket.on("connect", () => {
            console.log("✅ Socket connected:", socket.id);
        });

        socket.on("disconnect", (reason) => {
            console.log("❌ Socket disconnected:", reason);
        });

        socket.on("connect_error", (error) => {
            console.error("🔴 Socket connection error:", error);
        });

        return () => {
            socket.off("connect");
            socket.off("disconnect");
            socket.off("connect_error");
            socket.disconnect();
        };
    }, [socket, user]);

    // Join room when room is selected
    useEffect(() => {
        if (!socket || !room?._id || !user?._id || !selectedChat?._id) return;

        console.log("🔵 Joining room:", room._id);

        socket.emit("join:room", {
            userId: user._id,
            chatUserId: selectedChat._id
        }, (response) => {
            if (response?.success) {
                console.log("✅ Joined room successfully:", response.roomId);
            } else {
                console.error("❌ Failed to join room:", response?.error);
            }
        });

        return () => {
            if (room?._id) {
                console.log("🔵 Leaving room:", room._id);
                socket.emit("leave:room", room._id);
            }
        };
    }, [socket, room?._id, user?._id, selectedChat?._id]);

    return socket;
};

export default useSocket;

