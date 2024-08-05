import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import Step1Info from '../../components/subscription/Step1Info';
import Step2Image from '../../components/subscription/Step2Image';
import Step3Package from '../../components/subscription/Step3Package';
import Step4Payment from '../../components/subscription/Step4Payment';
import Step5Review from '../../components/subscription/Step5Review';
import { SubscriptionSchema } from '../../constant/schema';
import { FormData } from '../../constant/type/FormData';
import { uploadSubscription, resetStatus } from '../../redux/slices/uploadSubscription/uploadSubscription';
import { RootState, AppDispatch } from '../../redux/store';
import * as z from 'zod';
import StepperSubscription from '../../components/stepper/StepperSubscription';
import { FaArrowAltCircleLeft } from "react-icons/fa";
import ModalPreview from '../../components/modal/ModalPreview';

const Subscription: React.FC = () => {
    const [step, setStep] = useState<number>(1);
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        phone: '',
        personalPhoto: null,
        cccdPhotoFront: null,
        cccdPhotoBack: null,
        package: '',
        transactionImage: null
    });
    const [validationErrors, setValidationErrors] = useState<z.ZodError<FormData> | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
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
                variant: 'error',
                anchorOrigin: { vertical: 'top', horizontal: 'right' },
                autoHideDuration: 2000,
            });
            navigate('/');
        }
    }, [success, error, dispatch, navigate, enqueueSnackbar]);

    useEffect(() => {
        if (step === 5) {
            const result = SubscriptionSchema.safeParse(formData);
            if (!result.success) {
                setValidationErrors(result.error);
            } else {
                setValidationErrors(null);
            }
        }
    }, [step, formData]);

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    const handleChange = (input: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [input]: e.target.value });
    };

    const handleFileChange = (input: string) => (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement> | { target: { files: File[] } }) => {
        const file = (e as React.ChangeEvent<HTMLInputElement>).target?.files?.[0]
            || (e as React.DragEvent<HTMLDivElement>).dataTransfer?.files[0]
            || (e as { target: { files: File[] } }).target.files[0];

        setFormData({ ...formData, [input]: file || null });
    };

    const handleRemoveFile = (input: string) => () => {
        setFormData({ ...formData, [input]: null });
    };

    const getFieldError = (path: keyof FormData) => {
        return validationErrors?.formErrors.fieldErrors[path]?.[0] || '';
    };

    const isStepValid = (fields: (keyof FormData)[]): boolean => {
        return fields.every(field => !getFieldError(field));
    };

    const handlePreview = () => {
        setIsModalOpen(true);
    };

    const hasErrors = () => {
        const steps = [
            ['name', 'email', 'phone'],
            ['personalPhoto', 'cccdPhotoFront', 'cccdPhotoBack'],
            ['package'],
            ['transactionImage']
        ];
        return steps.some(step => !isStepValid(step as (keyof FormData)[]));
    };

    const handleSubmit = (data: FormData) => {
        setFormData(data);
        dispatch(uploadSubscription(data));
    };

    const handleClickBack = () => {
        navigate('/');
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return <Step1Info handleChange={handleChange} values={formData} />;
            case 2:
                return <Step2Image handleFileChange={handleFileChange} handleRemoveFile={handleRemoveFile} values={formData} />;
            case 3:
                return <Step3Package handleChange={handleChange} values={formData} />;
            case 4:
                return <Step4Payment handleFileChange={handleFileChange} handleRemoveFile={handleRemoveFile} values={formData} />;
            case 5:
                return <Step5Review
                    values={formData}
                    validationErrors={validationErrors}
                    handleChange={handleChange}
                    handleFileChange={handleFileChange}
                    handleRemoveFile={handleRemoveFile} />;
            default:
                return <div>Error</div>;
        }
    };


    return (
        <div className='bg-[#fefefe] min-h-screen'>
            <div className='max-w-[1440px] mx-auto p-10'>
                {renderStepContent()}
                <div className='mr-auto my-10'>
                </div>
                <div className='flex justify-end gap-5 my-10'>
                    <Button
                        sx={{
                            backgroundColor: '#333333',
                            '&:hover': {
                                backgroundColor: '#555555'
                            },
                            color: 'white'
                        }} variant="contained" onClick={handleClickBack} >
                        Cancel
                    </Button>
                    <Button
                        color="inherit"
                        variant="contained"
                        disabled={step === 1}
                        onClick={prevStep}
                        className='mt-auto'

                    >
                        Back
                    </Button>
                    {step !== 5 &&
                        <Button
                            variant="contained"
                            color="primary"
                            disabled={step === 5}
                            onClick={nextStep}
                        >
                            Next
                        </Button>
                    }

                    {step === 5 && (
                        <>
                            <Button
                                color='warning'
                                variant="contained"
                                disabled={hasErrors()}
                                onClick={handlePreview}
                                className=''
                            >
                                Preview
                            </Button>

                            <Button
                                color='success'
                                variant="contained"
                                disabled={hasErrors()}
                                onClick={() => handleSubmit(formData)}
                            >
                                Submit
                            </Button>
                        </>

                    )}
                </div>

                <ModalPreview
                    open={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    values={formData}
                    handleSubmit={() => {
                        handleSubmit(formData);
                        setIsModalOpen(false);
                    }}
                />
            </div>
        </div>
    );
};

export default Subscription;
