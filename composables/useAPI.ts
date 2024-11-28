// import { useRuntimeConfig } from "#app";
import { type TPost } from "~~/types/post";

export default () => {
    const config = useRuntimeConfig();
    const POST_URL = config.public.postsUrlAPI;

    const get = async <T>(endpoint: string) => {
        return useFetch<T>(`${POST_URL}${endpoint}`)
    }


    // Get All Posts
    const getPosts = async () => {
        return get<TPost[]>('/posts')  // ใช้ /posts endpoint เพื่อดึงข้อมูลโพสต์ทั้งหมด
    }

    return {
        getPosts
    }
};
