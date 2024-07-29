import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button, Snackbar } from '@mui/material';
import { useSnackbar } from 'notistack';
import Step1Info from '../../components/subscription/Step1Info';
import Step2Image from '../../components/subscription/Step2Image';
import Step3Package from '../../components/subscription/Step3Package';
import Step4Payment from '../../components/subscription/Step4Payment';
import ConfirmationModal from '../../components/modal/ConfirmationModal';
import { SubscriptionSchema } from '../../constant/schema';
import { FormData } from '../../constant/type/FormData';
import { uploadSubscription, resetStatus } from '../../redux/slices/uploadSubscription/uploadSubscription';
import { RootState, AppDispatch } from '../../redux/store';
import * as z from 'zod';


const Subscription: React.FC = () => {
    const [step, setStep] = useState<number>(1);
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        phone: '',
        personalPhoto: null,
        cccdPhotoFront: null,
        cccdPhotoBack: null,
        package: 'default',
        transactionImage: null
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [validationErrors, setValidationErrors] = useState<z.ZodError<FormData> | null>(null);

    const dispatch: AppDispatch = useDispatch();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const { loading, success, error } = useSelector((state: RootState) => state.subscription);

    useEffect(() => {
        if (success) {
            enqueueSnackbar('Đăng ký gói đã thành công!', {
                variant: 'success',
                anchorOrigin: { vertical: 'top', horizontal: 'right' },
                autoHideDuration: 2000,
            });
            navigate('/');
            dispatch(resetStatus());
        }
        if (error) {
            enqueueSnackbar('Đã xảy ra lỗi khi đăng ký!', {
                variant: 'error', anchorOrigin: { vertical: 'top', horizontal: 'right' },
                autoHideDuration: 2000,
            });
            navigate('/');
        }
    }, [success, error, dispatch, navigate, enqueueSnackbar]);

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    const handleChange = (input: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [input]: e.target.value });
    };

    const handleFileChange = (input: string) => (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
        const file = (e as React.ChangeEvent<HTMLInputElement>).target?.files?.[0] || (e as React.DragEvent<HTMLDivElement>).dataTransfer?.files[0];
        if (file) {
            setFormData({ ...formData, [input]: file });
        }
    };

    const handleSubmit = () => {
        const parsedData = SubscriptionSchema.safeParse(formData);
        if (parsedData.success) {
            setValidationErrors(null);
            setIsModalOpen(true);
        } else {
            setValidationErrors(parsedData.error);
        }
    };

    const handleConfirmSubmit = () => {
        dispatch(uploadSubscription(formData));
        setIsModalOpen(false);
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return <Step1Info handleChange={handleChange} values={formData} />;
            case 2:
                return <Step2Image handleFileChange={handleFileChange} values={formData} />;
            case 3:
                return <Step3Package handleChange={handleChange} values={formData} />;
            case 4:
                return <Step4Payment handleChange={handleChange} handleSubmit={handleSubmit} handleFileChange={handleFileChange} values={formData} />;
            default:
                return <div>Error</div>;
        }
    };

    const handleClickStep = (stepNum: number) => {
        setStep(stepNum);
    };

    return (
        <div className='max-w-[1440px] mx-auto bg-[#fefefe]'>
            <div className="steps">
                <div onClick={() => handleClickStep(1)} className={`step ${step === 1 ? 'active' : ''}`}>Step 1</div>
                <div onClick={() => handleClickStep(2)} className={`step ${step === 2 ? 'active' : ''}`}>Step 2</div>
                <div onClick={() => handleClickStep(3)} className={`step ${step === 3 ? 'active' : ''}`}>Step 3</div>
                <div onClick={() => handleClickStep(4)} className={`step ${step === 4 ? 'active' : ''}`}>Step 4</div>
            </div>
            {renderStepContent()}

            <div className='flex justify-around my-10'>
                <Button
                    variant="contained"
                    color="primary"
                    disabled={step === 1}
                    onClick={prevStep}
                >
                    Back
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    disabled={step === 4}
                    onClick={nextStep}
                >
                    Next
                </Button>
            </div>

            <ConfirmationModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmSubmit}
                formData={formData}
                validationErrors={validationErrors}
            />
        </div>
    );
};

export default Subscription;
