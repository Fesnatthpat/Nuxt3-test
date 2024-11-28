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

// Reactive variables
const title = ref<string>("");
const content = ref<string>("");
const posts = ref<TPost[] | null>(null);
const file = ref<File | null>(null);

// Load posts from API
const loadPosts = async (): Promise<void> => {
    try {
        const res = await $fetch<TPost[]>("/api/posts");
        posts.value = res;
    } catch (error) {
        console.error("Failed to load posts:", error);
        alert("Error loading posts.");
    }
};
await loadPosts();

// Handle file input
const handleFile = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files[0]) {
        file.value = target.files[0];
    }
};

// Add a new post
const submit = async () => {
    const formData = new FormData();
    formData.append("title", title.value);
    formData.append("content", content.value);
    if (file.value) {
        formData.append("image", file.value);  // ส่งไฟล์ที่เลือก
    }

    try {
        const response = await fetch('/api/posts', {
            method: 'POST',
            body: formData,  // ส่ง FormData แทน JSON
        });

        if (!response.ok) {
            throw new Error(`Failed to create post: ${response.statusText}`);
        }
        console.log('Post created successfully');
    } catch (error) {
        console.error('Failed to create post:', error);
    }
};

// Edit an existing post
const editPost = async (id: number): Promise<void> => {
    const newTitle = prompt("Enter new title:");
    const newContent = prompt("Enter new content:");

    if (newTitle && newContent) {
        try {
            const res = await $fetch<TPost>(`/api/posts/${id}`, {
                method: "PUT",
                body: { title: newTitle, content: newContent },
            });

            const index = posts.value?.findIndex((post) => post.id === id);
            if (index !== undefined && index >= 0 && posts.value) {
                posts.value[index] = res;
            }

            alert("Post updated successfully!");
        } catch (error) {
            console.error("Failed to update post:", error);
            alert("Error updating post.");
        }
    }
};

// Delete a post
const deletePost = async (id: number): Promise<void> => {
    if (confirm("Are you sure you want to delete this post?")) {
        try {
            await $fetch(`/api/posts/${id}`, { method: "DELETE" });
            if (posts.value) {
                posts.value = posts.value.filter((post) => post.id !== id);
            }
            alert("Post deleted successfully!");
        } catch (error) {
            console.error("Failed to delete post:", error);
            alert("Error deleting post.");
        }
    }
};

// Set page title
useHead({
    title: "Manage Posts",
});
</script>


<template>
    <div class="container mx-auto min-h-screen max-w-screen">
        <!-- Form for adding a new post -->
        <form @submit.prevent="submit" class="flex flex-col gap-4 items-center">
            <input v-model="title" type="text" placeholder="Title" class="w-1/2 p-2 border rounded" />
            <textarea v-model="content" placeholder="Content" class="w-1/2 p-2 border rounded"></textarea>
            <input type="file" @change="handleFile" class="w-1/2 p-2" />
            <button class="px-4 py-2 bg-green-500 text-white rounded">Add Post</button>
        </form>

        <!-- List of posts -->
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
