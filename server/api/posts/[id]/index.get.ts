// GET: http://localhost:3000/api/posts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    
    const id = getRouterParam(event, 'id')

    if (!id) {
        throw createError(
            {
                statusCode: 400,
                message: 'Invalid id'
            }
        )
    } else {
        const post = await prisma.post.findUnique({
            where: {
                id: parseInt(id)
            }
        })
        return post
    }
})