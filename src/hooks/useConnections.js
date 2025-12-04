import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../axios/axiosInstance";

// API Functions
const fetchConnections = async () => {
    const response = await axiosInstance.get("/connections");
    return response.data.data;
};

const fetchReceivedRequests = async () => {
    const response = await axiosInstance.get("/connections/requests/received");
    return response.data.data;
};

const fetchSentRequests = async () => {
    const response = await axiosInstance.get("/connections/requests/sent");
    return response.data.data;
};

const fetchDiscoverUsers = async ({ page = 1, limit = 20, search = "" }) => {
    const response = await axiosInstance.get("/connections/discover", {
        params: { page, limit, search },
    });
    return response.data;
};

const sendConnectionRequest = async ({ recipientId, message }) => {
    const response = await axiosInstance.post("/connections/request", {
        recipientId,
        message,
    });
    return response.data;
};

const acceptConnectionRequest = async (connectionId) => {
    const response = await axiosInstance.patch(`/connections/${connectionId}/accept`);
    return response.data;
};

const rejectConnectionRequest = async (connectionId) => {
    const response = await axiosInstance.patch(`/connections/${connectionId}/reject`);
    return response.data;
};

const cancelConnectionRequest = async (connectionId) => {
    const response = await axiosInstance.delete(`/connections/${connectionId}/cancel`);
    return response.data;
};

const removeConnection = async (connectionId) => {
    const response = await axiosInstance.delete(`/connections/${connectionId}`);
    return response.data;
};

// Hook for connected users (friends) with last messages
export const useConnections = () => {
    return useQuery({
        queryKey: ["connections"],
        queryFn: fetchConnections,
        staleTime: 1000 * 30, // 30 seconds - refresh more often to get latest messages
        refetchOnWindowFocus: true,
    });
};

// Hook for received requests
export const useReceivedRequests = () => {
    return useQuery({
        queryKey: ["connections", "received"],
        queryFn: fetchReceivedRequests,
        staleTime: 1000 * 30, // 30 seconds
    });
};

// Hook for sent requests
export const useSentRequests = () => {
    return useQuery({
        queryKey: ["connections", "sent"],
        queryFn: fetchSentRequests,
        staleTime: 1000 * 30, // 30 seconds
    });
};

// Hook for discovering users
export const useDiscoverUsers = (page = 1, limit = 20, search = "") => {
    return useQuery({
        queryKey: ["discover", page, limit, search],
        queryFn: () => fetchDiscoverUsers({ page, limit, search }),
        staleTime: 1000 * 60, // 1 minute
        keepPreviousData: true,
    });
};

// Hook for connection mutations
export const useConnectionMutations = () => {
    const queryClient = useQueryClient();

    const invalidateAll = () => {
        queryClient.invalidateQueries(["connections"]);
        queryClient.invalidateQueries(["discover"]);
    };

    const sendRequest = useMutation({
        mutationFn: sendConnectionRequest,
        onSuccess: () => {
            invalidateAll();
        },
    });

    const acceptRequest = useMutation({
        mutationFn: acceptConnectionRequest,
        onSuccess: () => {
            invalidateAll();
        },
    });

    const rejectRequest = useMutation({
        mutationFn: rejectConnectionRequest,
        onSuccess: () => {
            invalidateAll();
        },
    });

    const cancelRequest = useMutation({
        mutationFn: cancelConnectionRequest,
        onSuccess: () => {
            invalidateAll();
        },
    });

    const removeConn = useMutation({
        mutationFn: removeConnection,
        onSuccess: () => {
            invalidateAll();
        },
    });

    return {
        sendRequest,
        acceptRequest,
        rejectRequest,
        cancelRequest,
        removeConnection: removeConn,
    };
};

export default useConnections;

