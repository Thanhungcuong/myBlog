import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { FormData } from '../../constant/type/FormData';

interface Props {
    handleChange: (input: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    handleSubmit: () => void;
    handleFileChange: (input: string) => (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => void;
    values: { transactionImage: File | null };
}

const Step4Payment: React.FC<Props> = ({ handleChange, handleSubmit, handleFileChange, values }) => {
    const [previewTransactionImage, setPreviewTransactionImage] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (values.transactionImage) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewTransactionImage(reader.result as string);
            };
            reader.readAsDataURL(values.transactionImage);
        } else {
            setPreviewTransactionImage(null);
        }
    }, [values.transactionImage]);

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                Bước 4: Thanh toán
            </Typography>
            <div>
                <input
                    type="file"
                    onChange={handleFileChange('transactionImage')}
                    style={{ display: 'none' }}
                    id="transaction-image"
                />
                <label htmlFor="transaction-image">
                    <Button variant="contained" component="span">
                        Tải ảnh giao dịch lên
                    </Button>
                </label>
                {previewTransactionImage && (
                    <Box mt={2}>
                        <Typography variant="body1">Transaction Image Preview:</Typography>
                        <img src={previewTransactionImage} alt="Transaction Preview" style={{ maxWidth: '100%', height: 'auto' }} />
                    </Box>
                )}
            </div>
            <Box mt={4} textAlign="center">
                <Button onClick={handleSubmit} variant="contained">
                    Xác nhận
                </Button>
            </Box>
        </Box>
    );
};

export default Step4Payment;
