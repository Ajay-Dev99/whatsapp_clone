import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../axios/axiosInstance";

const fetchMessages = async (roomId, cursor = null, limit = 20) => {
    const params = { limit };
    if (cursor) {
        params.cursor = cursor;
    }

    const response = await axiosInstance.get(`/messages/${roomId}`, { params });
    return response.data.data;
};


const markMessagesAsRead = async (roomId) => {
    const response = await axiosInstance.patch(`/messages/${roomId}/mark-read`);
    return response.data.data;
};

const getUnreadCount = async (roomId) => {
    const response = await axiosInstance.get(`/messages/${roomId}/unread-count`);
    return response.data.data;
};


const useMessages = (roomId, limit = 20) => {
    const queryClient = useQueryClient();

    const {
        data,
        isLoading,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch
    } = useInfiniteQuery({
        queryKey: ["messages", roomId],
        queryFn: ({ pageParam = null }) => fetchMessages(roomId, pageParam, limit),
        getNextPageParam: (lastPage) => {
            if (lastPage?.pagination?.hasMore && lastPage?.pagination?.nextCursor) {
                return lastPage.pagination.nextCursor;
            }
            return undefined;
        },
        enabled: !!roomId,
        staleTime: 1000 * 60 * 5,
    });

    const messages = data?.pages?.flatMap(page => page.messages) || [];

    const markAsReadMutation = useMutation({
        mutationFn: () => markMessagesAsRead(roomId),
        onSuccess: () => {
            queryClient.invalidateQueries(["messages", roomId]);
        }
    });

    return {
        messages,
        isLoading,
        error,
        hasMore: hasNextPage,
        loadMore: fetchNextPage,
        isLoadingMore: isFetchingNextPage,
        refresh: refetch,
        markAsRead: markAsReadMutation.mutate,
        isMarkingAsRead: markAsReadMutation.isLoading
    };
};

export default useMessages;

export { fetchMessages, markMessagesAsRead, getUnreadCount };