import * as z from 'zod';

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