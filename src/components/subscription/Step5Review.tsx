import React, { useState, useEffect } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Button, Tooltip, IconButton } from '@mui/material';
import { FaCheckCircle, FaTimesCircle, FaEdit, FaQuestionCircle } from "react-icons/fa";
import { FormData } from '../../constant/type/FormData';
import { ZodError } from 'zod';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Step1Info from '../../components/subscription/Step1Info';
import Step2Image from '../../components/subscription/Step2Image';
import Step3Package from '../../components/subscription/Step3Package';
import Step4Payment from '../../components/subscription/Step4Payment';
import StepperSubscription from '../stepper/StepperSubscription';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
interface Props {
    values: FormData;
    validationErrors: ZodError<FormData> | null;
    handleChange: (input: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    handleFileChange: (input: string) => (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement> | { target: { files: File[] } }) => void;
    handleRemoveFile: (input: string) => () => void;
}

const Step5Review: React.FC<Props> = ({ values, validationErrors, handleChange, handleFileChange, handleRemoveFile }) => {
    const [editingStep, setEditingStep] = useState<number | null>(null);
    const [expanded, setExpanded] = useState<number[]>([]);

    const getFieldError = (path: keyof FormData) => {
        return validationErrors?.formErrors.fieldErrors[path]?.[0] || '';
    };

    const isStepValid = (fields: (keyof FormData)[]): boolean => {
        return fields.every(field => !getFieldError(field));
    };

    const steps = [
        {
            label: 'Thông tin cá nhân',
            fields: ['name', 'email', 'phone'] as (keyof FormData)[],
            reviewContent: (
                <div>
                    <div className='flex gap-2 items-center'>
                        <p className='font-semibold text-lg'>Tên: <span className='font-extralight'>{values.name}  </span></p>
                        {getFieldError('name') && <Typography color="error">{getFieldError('name')}</Typography>}
                    </div>
                    <div className='flex gap-2 items-center'>
                        <p className='font-semibold text-lg'>Email: <span className='font-extralight'>{values.email} </span></p>
                        {getFieldError('email') && <Typography color="error">{getFieldError('email')}</Typography>}
                    </div>
                    <div className='flex gap-2 items-center'>
                        <p className='font-semibold text-lg'>Phone: <span className='font-extralight'>{values.phone} </span></p>
                        {getFieldError('phone') && <Typography color="error">{getFieldError('phone')}</Typography>}
                    </div>
                </div>
            ),
            editComponent: (
                <Step1Info
                    values={values}
                    handleChange={handleChange}
                />
            )
        },
        {
            label: 'Ảnh cá nhân và CCCD',
            fields: ['personalPhoto', 'cccdPhotoFront', 'cccdPhotoBack'] as (keyof FormData)[],
            reviewContent: (
                <div className='flex flex-col gap-5'>
                    <div>
                        <p className='font-semibold text-lg'>Ảnh cá nhân</p>
                        {values.personalPhoto && <img src={URL.createObjectURL(values.personalPhoto)} alt="Personal" className='size-64 mx-auto my-auto' />}
                        {getFieldError('personalPhoto') && <Typography color="error">{getFieldError('personalPhoto')}</Typography>}
                    </div>
                    <div>
                        <p className='font-semibold text-lg'>Ảnh CCCD mặt trước</p>
                        {values.cccdPhotoFront && <img src={URL.createObjectURL(values.cccdPhotoFront)} alt="CCCD Front" className='size-64 mx-auto my-auto' />}
                        {getFieldError('cccdPhotoFront') && <Typography color="error">{getFieldError('cccdPhotoFront')}</Typography>}
                    </div>
                    <div>
                        <p className='font-semibold text-lg'>Ảnh CCCD mặt sau</p>
                        {values.cccdPhotoBack && <img src={URL.createObjectURL(values.cccdPhotoBack)} alt="CCCD Back" className='size-64 mx-auto my-auto' />}
                        {getFieldError('cccdPhotoBack') && <Typography color="error">{getFieldError('cccdPhotoBack')}</Typography>}
                    </div>
                </div>
            ),
            editComponent: (
                <Step2Image
                    values={values}
                    handleFileChange={handleFileChange}
                    handleRemoveFile={handleRemoveFile}
                />
            )
        },
        {
            label: 'Gói đăng ký',
            fields: ['package'] as (keyof FormData)[],
            reviewContent: (
                <div className='flex gap-2 mt-10'>
                    <p className='font-bold text-xl'>Gói đăng ký: {values.package}</p>
                    {getFieldError('package') && <Typography color="error">{getFieldError('package')}</Typography>}
                </div>
            ),
            editComponent: (
                <Step3Package
                    values={values}
                    handleChange={handleChange}
                />
            )
        },
        {
            label: 'Ảnh giao dịch',
            fields: ['transactionImage'] as (keyof FormData)[],
            reviewContent: (
                <div className='mt-10'>
                    <p className='font-bold text-xl'>Ảnh giao dịch</p>
                    <div className='flex justify-center gap-2'>
                        {values.transactionImage && <img src={URL.createObjectURL(values.transactionImage)} alt="Transaction" className='size-64' />}
                        {getFieldError('transactionImage') && <Typography color="error">{getFieldError('transactionImage')}</Typography>}
                    </div>
                </div>
            ),
            editComponent: (
                <Step4Payment
                    values={values}
                    handleFileChange={handleFileChange}
                    handleRemoveFile={handleRemoveFile}
                />
            )
        }
    ];

    useEffect(() => {
        const initialExpanded: number[] = [];
        steps.forEach((step, index) => {
            if (!isStepValid(step.fields)) {
                initialExpanded.push(index);
            }
        });
        setExpanded(initialExpanded);
    }, [values, validationErrors]);

    const handleAccordionChange = (index: number) => {
        setExpanded(prevExpanded =>
            prevExpanded.includes(index)
                ? prevExpanded.filter(i => i !== index)
                : [...prevExpanded, index]
        );
    };

    const handleEditClick = (index: number) => {
        setEditingStep(index);
    };

    const handleSaveClick = () => {
        setEditingStep(null);
    };

    const renderStepperMobi = (step: number) => {
        switch (step) {
            case 1:
                return <p className='text-lg text-blue-700'> Step 1: Infomation </p>
            case 2:
                return <p className='text-lg text-blue-700'> Step 2: Personal </p>
            case 3:
                return <p className='text-lg text-blue-700'> Step 3: Subscription </p>
            case 4:
                return <p className='text-lg text-blue-700'> Step 4: Transaction</p>
            case 5:
                return <p className='text-lg text-blue-700'> Step 5: Confirm</p>
        }
    }

    return (
        <div className='bg-white shadow-lg p-10 rounded-md'>

            <div>
                <div className='max-xl:hidden'>
                    <StepperSubscription step={5} />
                </div>
                <div className='xl:hidden flex gap-2 items-center'>
                    <div className='my-10 size-10 flex justify-center items-center  bg-blue-400 text-white rounded-full'>
                        5
                    </div>
                    {renderStepperMobi(5)}
                    <p className='text-lg text-blue-700'>/ 5 Step</p>
                </div>
            </div>
            <div className='flex items-end gap-5'>

                <p className='text-5xl max-sm:text-2xl font-bold w-fit text-center'>Review thông tin đăng ký

                </p>
                <div>

                    <Tooltip title="If you want to edit informations, click on the icon">
                        <QuestionMarkIcon />
                    </Tooltip>
                </div>
            </div>

            <div className='my-10 flex max-sm:flex-col w-full gap-3'>
                <p className='text-lg text-left'>Nếu bạn muốn chỉnh sửa lại các trường thông tin, ấn vào biểu tượng bên cạnh</p>
            </div>

            {steps.map((step, index) => (
                <Accordion
                    key={index}
                    expanded={expanded.includes(index)}
                    onChange={() => handleAccordionChange(index)}
                    className='mb-5'>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} style={{ backgroundColor: isStepValid(step.fields) ? '#00ba37' : '#F63638' }}>
                        <Typography className='flex items-center text-white'>
                            {isStepValid(step.fields) ? (
                                <FaCheckCircle className=' mr-2' />
                            ) : (
                                <FaTimesCircle className='mr-2' />
                            )}
                            Step {index + 1}: {step.label}
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails className='flex flex-col gap-5'>
                        {editingStep === index ? (
                            <>
                                {step.editComponent}
                                <div className='w-30 ml-auto'>

                                    <Button variant="contained" color="primary" onClick={handleSaveClick}>
                                        Save
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <>
                                {step.reviewContent}
                                <FaEdit onClick={() => handleEditClick(index)} className='cursor-pointer ml-auto text-2xl' />
                            </>
                        )}
                    </AccordionDetails>
                </Accordion>
            ))}
        </div>
    );
};

export default Step5Review;
