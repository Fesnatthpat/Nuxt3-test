import { PrismaClient } from "@prisma/client"

type TPost = {
    title: string
    content: string
    published: boolean
}

const prisma =  new PrismaClient()

export default defineEventHandler(async (event) => {
    
    const body = await readBody<TPost>(event)

    const post = await prisma.post.create({
        data: {
            title: body.title,
            content: body.content,
            published: body.published
        }
    })
    return post

})