import * as z from 'zod';

export const LoginSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export const RegisterSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters" })
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

const imageSizeValidator = async (file: File | null) => {
    if (!file) return true;

    const img = new Image();
    img.src = URL.createObjectURL(file);

    return new Promise<boolean>((resolve) => {
        img.onload = () => {
            const isValid = img.width <= 2048 && img.height <= 2048;
            resolve(isValid);
        };
    });
};

export const EditProfileSchema = z.object({
    tempName: z.string().max(50, "Tên không được quá 50 kí tự!"),
    tempBio: z.string().max(100, "Tiểu sử không được quá 100 kí tự!"),
    tempBirthday: z.union([z.string().refine((date) => !isNaN(Date.parse(date)), "Invalid date format"), z.null()]),
    avatarFile: z.instanceof(File).nullable().refine(async (file) => await imageSizeValidator(file), {
        message: "Ảnh đại diện không được vượt quá 2048 x 2048 px",
    }),
    coverPhotoFile: z.instanceof(File).nullable().refine(async (file) => await imageSizeValidator(file), {
        message: "Ảnh bìa không được vượt quá 2048 x 2048 px",
    }),
});



export const PostSchema = z.object({
    postContent: z.string().max(500, "Bài viết không được quá 500 kí tự!"),
    imageFiles: z.array(z.instanceof(File)).refine(async (files) => {
        for (const file of files) {
            if (!(await imageSizeValidator(file))) {
                return false;
            }
        }
        return true;
    }, { message: "Ảnh không được vượt quá 2048 x 2048 px" })
});