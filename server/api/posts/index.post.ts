import formidable from "formidable";
import { existsSync, mkdirSync } from "fs";
import fs from "fs/promises";
import { PrismaClient } from "@prisma/client";
import path from "path";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    try {
        // สร้างโฟลเดอร์อัปโหลดถ้ายังไม่มี
        const uploadDir = path.resolve("public/uploads");
        if (!existsSync(uploadDir)) {
            mkdirSync(uploadDir, { recursive: true });
            console.log("Upload directory created:", uploadDir);
        }

        // ตั้งค่า formidable
        const form = formidable({
            uploadDir,
            keepExtensions: true,
            maxFileSize: 5 * 1024 * 1024, // ขนาดไฟล์สูงสุด 5MB
            filename: (name, ext, part) => `${Date.now()}-${part.originalFilename}`,
        });

        // แยก fields และ files
        const { fields, files }: { fields: Record<string, any>; files: Record<string, any> } = await new Promise((resolve, reject) => {
            form.parse(event.node.req, (err, fields, files) => {
                if (err) {
                    reject(new Error("Error parsing the form: " + err.message));
                }
                resolve({ fields, files });
            });
        });

        // log ข้อมูลที่ได้จาก fields และ files
        console.log("Fields:", fields);
        console.log("Files:", files);

        // ตรวจสอบ title และ content
        const title = fields.title?.trim() || "Untitled";
        const content = fields.content?.trim() || "";

        if (!/^[\w\s\-.]+$/.test(title)) {
            throw new Error("Invalid characters in title.");
        }

        // ตรวจสอบไฟล์
        const file = Array.isArray(files.file) ? files.file[0] : files.file;
        if (!file || !file.originalFilename) {
            throw new Error("No valid file uploaded.");
        }

        // ตรวจสอบประเภทไฟล์และขนาด
        const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
        if (!allowedTypes.includes(file.mimetype)) {
            await fs.unlink(file.filepath);
            throw new Error("Invalid file type.");
        }

        const maxFileSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxFileSize) {
            await fs.unlink(file.filepath);
            throw new Error("File size exceeds the maximum limit of 5MB.");
        }

        // URL ไฟล์ที่อัปโหลด
        const imageUrl = `/uploads/${path.basename(file.filepath)}`;

        // บันทึกข้อมูลในฐานข้อมูล
        const post = await prisma.post.create({
            data: {
                title,
                content,
                image: imageUrl,
                published: true,
            },
        });

        console.log("Post created successfully:", post);
        return post;
    } catch (error) {
        const err = error as Error; // แปลง error เป็นชนิด Error
        console.error("API Error:", err.message);
        throw createError({
            statusCode: 500,
            message: err.message || "Internal Server Error",
        });
    }
});
