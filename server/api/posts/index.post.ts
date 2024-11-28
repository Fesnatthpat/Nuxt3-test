import formidable from "formidable";
import fs from "fs/promises";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    try {
        const form = formidable({
            uploadDir: "./public/uploads", // อัปโหลดไฟล์ไปยัง public/uploads
            keepExtensions: true,
        });

        const { fields, files } = await new Promise<any>((resolve, reject) => {
            form.parse(event.node.req, (err, fields, files) => {
                if (err) reject(err);
                resolve({ fields, files });
            });
        });

        // ตรวจสอบข้อมูลที่ได้รับ
        console.log("Fields:", fields);
        console.log("Files:", files);

        const file = files.file?.[ 0 ] ?? files.file; // จัดการกรณีหลายไฟล์
        const imageUrl = file ? `/uploads/${file.newFilename}` : null;

        // สร้างโพสต์ในฐานข้อมูล
        const post = await prisma.post.create({
            data: {
                title: fields.title || "Untitled",
                content: fields.content || "",
                image: imageUrl,
                published: true,
            },
        });

        return post;
    } catch (error) {
        console.error("API Error:", error);
        throw createError({
            statusCode: 500,
            message: "Internal Server Error",
        });
    }
});
