export interface FormData {
    name: string;
    email: string;
    phone: string;
    personalPhoto: File | null;
    cccdPhotoFront: File | null;
    cccdPhotoBack: File | null;
    package: string;
    transactionImage: File | null;
}