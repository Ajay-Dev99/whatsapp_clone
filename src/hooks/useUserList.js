import { useInfiniteQuery } from "@tanstack/react-query";
import axiosInstance from "../axios/axiosInstance";


export const useUserList = (limit = 10) => {
    return useInfiniteQuery({
        queryKey: ["users"],
        queryFn: async ({ pageParam = 1 }) => {
            const res = await axiosInstance.get(`/users/list`, {
                params: { page: pageParam, limit },
            });
         
            return res.data;
        },
        getNextPageParam: (lastPage, pages) => {
            if (lastPage && typeof lastPage?.nextPage !== "undefined") {
                return lastPage?.nextPage || undefined;
            }

            
            if (lastPage && typeof lastPage?.hasMore !== "undefined") {
                return lastPage?.hasMore ? pages?.length + 1 : undefined;
            }

          
            if (lastPage && Array.isArray(lastPage?.data) && lastPage?.data?.length === limit) {
                return pages?.length + 1;
            }

            return undefined;
        },
    });
};