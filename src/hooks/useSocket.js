import { useEffect, useMemo } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

const useSocket = () => {
    const { user, selectedChat } = useSelector((state) => state.user || {});

    const socket = useMemo(() => {
        return io(SOCKET_URL, {
            autoConnect: false,
            transports: ["websocket"],
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

        return () => {
            socket.disconnect();
        };
    }, [socket, user]);

    useEffect(() => {
        if (!selectedChat?.roomId) return;

        socket.emit("join:room", selectedChat.roomId);

        return () => {
            socket.emit("leave:room", selectedChat.roomId);
        };
    }, [socket, selectedChat]);

    return socket;
};

export default useSocket;

