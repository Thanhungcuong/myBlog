import * as z from 'zod';

const fileSchema = z.instanceof(File).refine(file => file.size <= 2 * 1024 * 1024, 'File phải nhỏ hơn 2MB');

export const SubscriptionSchema = z.object({
    name: z.string().nonempty({ message: 'Tên là bắt buộc' }),
    email: z.string().email({ message: 'Email không hợp lệ' }).nonempty({ message: 'Email là bắt buộc' }),
    phone: z.string()
        .nonempty({ message: 'Số điện thoại là bắt buộc' })
        .refine(val => /^[0-9]{8,12}$/.test(val), {
            message: 'Số điện thoại phải là số và từ 8 đến 12 chữ số',
        }),
    personalPhoto: z.preprocess(
        file => (file instanceof File ? file : undefined),
        fileSchema.optional()
    ).refine(file => !!file, { message: 'Ảnh cá nhân là bắt buộc' }),
    cccdPhotoFront: z.preprocess(
        file => (file instanceof File ? file : undefined),
        fileSchema.optional()
    ).refine(file => !!file, { message: 'Ảnh CCCD mặt trước là bắt buộc' }),
    cccdPhotoBack: z.preprocess(
        file => (file instanceof File ? file : undefined),
        fileSchema.optional()
    ).refine(file => !!file, { message: 'Ảnh CCCD mặt sau là bắt buộc' }),
    package: z.string().nonempty({ message: 'Gói đăng ký là bắt buộc' }),
    transactionImage: z.preprocess(
        file => (file instanceof File ? file : undefined),
        fileSchema.optional()
    ).refine(file => !!file, { message: 'Ảnh giao dịch là bắt buộc' }),
});
