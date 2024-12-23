// GET: http://localhost:3000/api/posts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {

    const posts = await prisma.post.findMany()

    return posts
})