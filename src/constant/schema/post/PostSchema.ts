import * as z from 'zod';

const fileSizeValidator = (file: File | null, maxSizeInMB: number) => {
    if (!file) return true;
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
};

export const PostSchema = z.object({
    postContent: z.string().max(500, "Bài viết không được quá 500 kí tự!"),
    imageFiles: z.array(z.instanceof(File)).refine((files) => {
        for (const file of files) {
            if (!fileSizeValidator(file, 2)) {
                return false;
            }
        }
        return true;
    }, { message: "Ảnh không được vượt quá 2MB" }),
    videoFile: z.instanceof(File).nullable().refine((file) => fileSizeValidator(file, 5), { 
        message: "Video không được vượt quá 5MB" 
    }).optional()
});
