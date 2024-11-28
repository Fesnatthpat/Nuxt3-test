<script setup lang="ts">
import { ref } from "vue";

// Define TPost Type
type TPost = {
    id: number;
    title: string;
    content: string | null;
    image: string | null;
    createdAt: string;
    updatedAt: string;
    published: boolean;
};

// สร้างตัวแปร reactive
const title = ref("");
const content = ref("");
const posts = ref<TPost[] | null>(null);
const file = ref<File | null>(null);

// โหลดโพสต์จาก API
const loadPosts = async () => {
    try {
        const res = await $fetch<TPost[]>("/api/posts");
        posts.value = res;
    } catch (err) {
        console.error("Failed to load posts:", err);
    }
};
await loadPosts();

// จัดการการอัปโหลดไฟล์
const handleFile = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files) {
        file.value = target.files[ 0 ];
    }
};

// ฟังก์ชันเพิ่มโพสต์ใหม่
const submit = async () => {
    if (!file.value) {
        alert("Please select an image.");
        return;
    }

    const formData = new FormData();
    formData.append("title", title.value);
    formData.append("content", content.value || "");
    formData.append("file", file.value);

    try {
        const res = await $fetch<TPost>("/api/posts", {
            method: "POST",
            body: formData,
        });
        console.log(res)

        if (posts.value) {
            posts.value.unshift(res);
        } else {
            posts.value = [ res ];
        }

        alert("Post created successfully!");
        title.value = "";
        content.value = "";
        file.value = null;
    } catch (err) {
        console.error(err);
        alert("Failed to create post.");
    }
};

// ฟังก์ชันแก้ไขโพสต์
const editPost = async (id: number) => {
    const newTitle = prompt("Enter new title:");
    const newContent = prompt("Enter new content:");

    if (newTitle && newContent) {
        try {
            const res = await $fetch<TPost>(`/api/posts/${id}`, {
                method: "PUT",
                body: {
                    title: newTitle,
                    content: newContent,
                },
            });

            const index = posts.value?.findIndex((post) => post.id === id);
            if (index !== undefined && index >= 0 && posts.value) {
                posts.value[ index ] = res;
            }

            alert("Post updated successfully!");
        } catch (err) {
            console.error(err);
            alert("Failed to update post.");
        }
    }
};

// ฟังก์ชันลบโพสต์
const deletePost = async (id: number) => {
    if (confirm("Are you sure you want to delete this post?")) {
        try {
            await $fetch(`/api/posts/${id}`, { method: "DELETE" });
            if (posts.value) {
                posts.value = posts.value.filter((post) => post.id !== id);
            }
            alert("Post deleted successfully!");
        } catch (err) {
            console.error(err);
            alert("Failed to delete post.");
        }
    }
};

useHead({
    title: "Manage Posts",
});
</script>

<template>
    <div class="container mx-auto min-h-screen max-w-screen">
        <!-- Form สำหรับเพิ่มโพสต์ -->
        <form @submit.prevent="submit" class="flex flex-col gap-4 items-center">
            <input v-model="title" type="text" placeholder="Title" class="w-1/2 p-2 border rounded" />
            <input v-model="content" type="text" placeholder="Content" class="w-1/2 p-2 border rounded" />
            <input type="file" @change="handleFile" class="w-1/2 p-2" />
            <button class="px-4 py-2 bg-green-500 text-white rounded">Add Post</button>
        </form>

        <!-- รายการโพสต์ -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            <div v-for="post in posts || []" :key="post.id" class="p-4 border rounded shadow-md bg-gray-100">
                <h3 class="text-lg font-bold">{{ post.title }}</h3>
                <p>{{ post.content }}</p>
                <p class="text-sm text-gray-500">{{ post.createdAt }}</p>
                <div v-if="post.image" class="mt-2">
                    <img :src="post.image" alt="Post image" class="w-full h-40 object-cover" />
                </div>
                <div class="flex justify-between mt-4">
                    <button class="px-3 py-1 bg-yellow-500 text-white rounded" @click="editPost(post.id)">
                        Edit
                    </button>
                    <button class="px-3 py-1 bg-red-500 text-white rounded" @click="deletePost(post.id)">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
