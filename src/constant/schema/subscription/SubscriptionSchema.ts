import * as z from 'zod';

export const SubscriptionSchema = z.object({
    name: z.string().nonempty('Name is required'),
    email: z.string().email('Invalid email').nonempty('Email is required'),
    phone: z.string()
    .nonempty('Phone number is required')
    .refine(val => /^[0-9]{8,12}$/.test(val), {
        message: 'Phone number must be numeric and between 8 to 12 digits',
    }),
    personalPhoto: z.instanceof(File).refine(file => file.size <= 2 * 1024 * 1024, 'Personal photo must be less than 2MB'),
    cccdPhotoFront: z.instanceof(File).refine(file => file.size <= 2 * 1024 * 1024, 'CCCD front photo must be less than 2MB'),
    cccdPhotoBack: z.instanceof(File).refine(file => file.size <= 2 * 1024 * 1024, 'CCCD back photo must be less than 2MB'),
    package: z.string().nonempty('Package is required'),
    transactionImage: z.instanceof(File).refine(file => file.size <= 2 * 1024 * 1024, 'Transaction image must be less than 2MB'),
});

