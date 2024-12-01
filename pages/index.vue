<script setup lang="ts">
import { ref } from 'vue';

// Define TPost Type
type TPost = {
    id: number;
    title: string;
    content: string | null; // เนื่องจาก `content` อาจเป็น `null`
    createdAt: string;
    updatedAt: string;
    published: boolean;
};

// สร้างตัวแปร reactive
const title = ref('');
const content = ref('');
const posts = ref<TPost[] | null>(null); // posts อาจเป็น null

// โหลดโพสต์จาก API
const loadPosts = async () => {
    try {
        const res = await $fetch<TPost[]>(`/api/posts`);
        posts.value = res; // อัปเดตค่า posts.value
    } catch (err) {
        console.error('Failed to load posts:', err);
    }
};
await loadPosts();

// ฟังก์ชันเพิ่มโพสต์ใหม่
async function submit() {
    try {
        const res = await $fetch<TPost>(`/api/posts`, {
            method: 'POST',
            body: {
                title: title.value,
                content: content.value,
            },
        });

        if (posts.value) {
            posts.value.unshift(res); // เพิ่มโพสต์ใหม่
        } else {
            posts.value = [res];
        }

        alert('Post created successfully!');
        title.value = '';
        content.value = '';
    } catch (err) {
        console.log(err);
        alert('Failed to create post.');
    }
}

// ฟังก์ชันแก้ไขโพสต์
const editPost = async (id: number) => {
    const newTitle = prompt('Enter new title:');
    const newContent = prompt('Enter new content:');

    if (newTitle && newContent) {
        try {
            const res = await $fetch<TPost>(`/api/posts/${id}`, {
                method: 'PUT',
                body: {
                    title: newTitle,
                    content: newContent,
                    published: true,
                },
            });

            const index = posts.value?.findIndex((post) => post.id === id);
            if (index !== undefined && index >= 0 && posts.value) {
                posts.value[index] = res;
            }

            alert('Post updated successfully!');
        } catch (err) {
            console.error(err);
            alert('Failed to update post.');
        }
    }
};

// ฟังก์ชันลบโพสต์
const deletePost = async (id: number) => {
    if (confirm('Are you sure you want to delete this post?')) {
        try {
            await $fetch(`/api/posts/${id}`, { 
                method: 'DELETE' 
            });
            if (posts.value) {
                posts.value = posts.value.filter((post) => post.id !== id);
            }
            alert('Post deleted successfully!');
        } catch (err) {
            console.log(err);
            alert('Failed to delete post.');
        }
    }
}

useHead({
    title: 'POST',
    meta: [{ name: 'description', content: 'My amazing site.' }],
    bodyAttrs: { class: 'test' },
});
</script>

<template>
    <div class="container mx-auto min-h-screen max-w-screen">
        <form @submit.prevent="submit" class="flex justify-center items-center">
            <div class="flex flex-col">
                <input v-model="title" type="text" placeholder="Title" class="mt-5 mx-4">
                <input v-model="content" type="text" placeholder="Content" class="mt-5 mx-4">
                <button class="btn btn-success mt-3">POST</button>
            </div>
        </form>
        <div class="container w-full h-full sm:h-60 mt-10 grid grid-cols-1 lg:grid-cols-4 sm:grid-cols-2 p-5 gap-3">
            <div v-for="post in posts || []" :key="post.id"
                class="w-full h-full overflow-y-scroll p-5 border bg-slate-500 rounded-md">
                <div>
                    <h1 class="text-2xl text-white">{{ post.id }}</h1>
                    <h1 class="text-2xl text-white">{{ post.title }}</h1>
                    <h1 class="text-2xl text-white">{{ post.content }}</h1>
                    <h1 class="text-2xl text-white overflow-hidden">{{ post.createdAt }}</h1>
                </div>
                <div class="flex justify-between items-center mx-auto p-2">
                    <button class="btn btn-square" @click="editPost(post.id)">Edit</button>
                    <button class="btn btn-warning" @click="deletePost(post.id)">Delete</button>
                </div>
            </div>
        </div>
    </div>
</template>
