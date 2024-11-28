import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');
    const body = await readBody(event);

    if (!id || !body.title || !body.content) {
        throw createError({
            statusCode: 400,
            message: 'Invalid data',
        });
    }

    const post = await prisma.post.update({
        where: { id: Number(id) },
        data: {
            title: body.title,
            content: body.content,
            published: body.published || false,
        },
    });

    return post;
});
