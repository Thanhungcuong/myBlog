import React from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';
import * as z from 'zod';
import { FormData } from '../../constant/type/FormData';

interface ConfirmationModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    formData: FormData;
    validationErrors: z.ZodError<FormData> | null;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ open, onClose, onConfirm, formData, validationErrors }) => {
    const hasErrors = validationErrors ? validationErrors.errors.length > 0 : false;

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={{ maxWidth: 600, margin: 'auto', p: 4, bgcolor: 'background.paper', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>Xác nhận thông tin đăng ký</Typography>
                <Typography variant="body1"><strong>Name:</strong> {formData.name}</Typography>
                <Typography variant="body1"><strong>Email:</strong> {formData.email}</Typography>
                <Typography variant="body1"><strong>Phone:</strong> {formData.phone}</Typography>
                <Typography variant="body1"><strong>Package:</strong> {formData.package}</Typography>
                {validationErrors && (
                    <Box mt={2}>
                        {validationErrors.errors.map((error, index) => (
                            <Typography key={index} color="error">{error.message}</Typography>
                        ))}
                    </Box>
                )}
                <Box mt={4} textAlign="center">
                    <Button onClick={onConfirm} variant="contained" color="primary" disabled={hasErrors}>
                        Confirm
                    </Button>
                    <Button onClick={onClose} variant="outlined" color="secondary" style={{ marginLeft: '10px' }}>
                        Cancel
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default ConfirmationModal;
