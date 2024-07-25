import * as z from 'zod';

const fileSizeValidator = (file: File | null, maxSizeInMB: number) => {
    if (!file) return true;
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
};

export const EditProfileSchema = z.object({
    tempName: z.string().max(50, "Tên không được quá 50 kí tự!"),
    tempBio: z.string().max(100, "Tiểu sử không được quá 100 kí tự!"),
    tempBirthday: z.union([z.string().refine((date) => !isNaN(Date.parse(date)), "Invalid date format"), z.null()]),
    avatarFile: z.instanceof(File).nullable().refine((file) => fileSizeValidator(file, 2), {
        message: "Ảnh đại diện không được vượt quá 2MB",
    }),
    coverPhotoFile: z.instanceof(File).nullable().refine((file) => fileSizeValidator(file, 2), {
        message: "Ảnh bìa không được vượt quá 2MB",
    }),
});
