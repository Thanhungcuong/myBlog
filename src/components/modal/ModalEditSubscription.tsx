import React from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';
import Step1Info from '../../components/subscription/Step1Info';
import Step2Image from '../../components/subscription/Step2Image';
import Step3Package from '../../components/subscription/Step3Package';
import Step4Payment from '../../components/subscription/Step4Payment';
import { FormData } from '../../constant/type/FormData';
import { FaTimes } from 'react-icons/fa';

interface ModalEditSubscriptionProps {
    open: boolean;
    handleClose: () => void;
    handleChange: (input: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    handleFileChange: (input: string) => (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement> | { target: { files: File[] } }) => void;
    formData: FormData;
    handleSave: () => void;
    handleRemoveFile: (input: string) => () => void;
    editingStep: number;
}

const ModalEditSubscription: React.FC<ModalEditSubscriptionProps> = ({
    open,
    handleClose,
    handleChange,
    handleFileChange,
    formData,
    handleSave,
    handleRemoveFile,
    editingStep
}) => {
    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            className='overflow-scroll'
        >
            <Box sx={{
                bgcolor: 'background.paper', p: 4, maxWidth: 600, margin: 'auto', mt: 5, width: 1000, '@media (max-width: 600px)': {
                    width: '100%',
                    maxWidth: '100%',
                }
            }}>
                <FaTimes className='ml-auto cursor-pointer' onClick={handleClose} />
                <Typography id="modal-modal-title" variant="h6" component="h2">
                    Chỉnh sửa thông tin đăng ký
                </Typography>
                {editingStep === 0 && <Step1Info handleChange={handleChange} values={formData} />}
                {editingStep === 1 && <Step2Image handleFileChange={handleFileChange} handleRemoveFile={handleRemoveFile} values={formData} />}
                {editingStep === 2 && <Step3Package handleChange={handleChange} values={formData} />}
                {editingStep === 3 && <Step4Payment handleFileChange={handleFileChange} handleRemoveFile={handleRemoveFile} values={formData} />}
                <Button variant="contained" color="primary" onClick={handleSave}>
                    Save Changes
                </Button>
            </Box>
        </Modal>
    );
};

export default ModalEditSubscription;