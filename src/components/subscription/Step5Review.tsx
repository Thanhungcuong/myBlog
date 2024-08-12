import React, { useState, useEffect } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Button, TextField, Box, Tooltip, IconButton } from '@mui/material';
import { FaCheckCircle, FaTimesCircle, FaEdit, FaSave, FaTimes, FaCloudUploadAlt } from "react-icons/fa";
import { FormData } from '../../constant/type/FormData';
import { ZodError } from 'zod';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import {
    TableRow, TableCell,
    RadioGroup, FormControlLabel, Radio,
} from '@mui/material';

interface Props {
    values: FormData;
    setValues: (values: FormData) => void;
    validationErrors: ZodError<FormData> | null;
}

const Step5Review: React.FC<Props> = ({ values, setValues, validationErrors }) => {
    const [expanded, setExpanded] = useState<number[]>([]);
    const [editMode, setEditMode] = useState<number | null>(null);
    const [localValues, setLocalValues] = useState<FormData>(values);

    const getFieldError = (path: keyof FormData) => {
        return validationErrors?.formErrors.fieldErrors[path]?.[0] || '';
    };

    const isStepValid = (fields: (keyof FormData)[]): boolean => {
        return fields.every(field => !getFieldError(field));
    };

    const handleFileChange = (input: string) => (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement> | { target: { files: File[] } }) => {
        const file = (e as React.ChangeEvent<HTMLInputElement>).target?.files?.[0]
            || (e as React.DragEvent<HTMLDivElement>).dataTransfer?.files[0]
            || (e as { target: { files: File[] } }).target.files[0];

        setLocalValues({ ...localValues, [input]: file || null });
    };

    const handleRemoveFile = (input: string) => () => {
        setLocalValues({ ...localValues, [input]: null });
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, input: string) => {
        e.preventDefault();
        handleFileChange(input)(e);
    };

    const steps = [
        {
            label: 'Thông tin cá nhân',
            fields: ['name', 'email', 'phone'] as (keyof FormData)[],
            content: (
                <div>
                    {editMode === 0 ? (
                        <div className='flex flex-col gap-10 my-10'>
                            <p className='font-semibold text-lg'>
                                Name
                            </p>
                            <TextField
                                label="Tên"
                                value={localValues.name}
                                onChange={(e) => setLocalValues({ ...localValues, name: e.target.value })}
                                error={!!getFieldError('name')}
                                helperText={getFieldError('name')}
                                fullWidth
                                disabled={editMode !== 0}
                            />
                            <p className='font-semibold text-lg'>
                                Email
                            </p>
                            <TextField
                                label="Email"
                                value={localValues.email}
                                onChange={(e) => setLocalValues({ ...localValues, email: e.target.value })}
                                error={!!getFieldError('email')}
                                helperText={getFieldError('email')}
                                fullWidth
                                disabled={editMode !== 0}
                            />
                            <p className='font-semibold text-lg'>
                                Phone
                            </p>
                            <TextField
                                label="Phone"
                                value={localValues.phone}
                                onChange={(e) => setLocalValues({ ...localValues, phone: e.target.value })}
                                error={!!getFieldError('phone')}
                                helperText={getFieldError('phone')}
                                fullWidth
                                disabled={editMode !== 0}
                            />
                        </div>
                    ) : (
                        <div className='flex flex-col gap-10 my-10'>
                            <p className='font-semibold text-lg'>
                                Name
                            </p>
                            <TextField
                                label="Tên"
                                value={localValues.name}
                                onChange={(e) => setLocalValues({ ...localValues, name: e.target.value })}
                                error={!!getFieldError('name')}
                                helperText={getFieldError('name')}
                                fullWidth
                                disabled={true}
                            />
                            <p className='font-semibold text-lg'>
                                Email
                            </p>
                            <TextField
                                label="Email"
                                value={localValues.email}
                                onChange={(e) => setLocalValues({ ...localValues, email: e.target.value })}
                                error={!!getFieldError('email')}
                                helperText={getFieldError('email')}
                                fullWidth
                                disabled={true}
                            />
                            <p className='font-semibold text-lg'>
                                Phone
                            </p>
                            <TextField
                                label="Phone"
                                value={localValues.phone}
                                onChange={(e) => setLocalValues({ ...localValues, phone: e.target.value })}
                                error={!!getFieldError('phone')}
                                helperText={getFieldError('phone')}
                                fullWidth
                                disabled={true}
                            />
                        </div>
                    )}
                </div>
            )
        },
        {
            label: 'Ảnh cá nhân và CCCD',
            fields: ['personalPhoto', 'cccdPhotoFront', 'cccdPhotoBack'] as (keyof FormData)[],
            content: (
                <div className='flex flex-col gap-5'>
                    {editMode === 1 ? (
                        <div className='flex flex-col gap-5'>
                            <div>
                                <p className='font-semibold text-lg'>
                                    Ảnh cá nhân
                                </p>
                                <Box onDrop={(e) => handleDrop(e, 'personalPhoto')} onDragOver={(e) => e.preventDefault()}>
                                    {localValues.personalPhoto ? (
                                        <div className='relative'>
                                            <Button
                                                color='error'
                                                onClick={handleRemoveFile('personalPhoto')}
                                                className='absolute top-[30%] left-[90%] text-red-500'
                                            >
                                                <FaTimes className='text-xl' />
                                            </Button>
                                            <img src={URL.createObjectURL(localValues.personalPhoto)} alt="Personal" className='size-64 mx-auto my-auto' />
                                        </div>
                                    ) : (
                                        <>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange('personalPhoto')}
                                                style={{ display: 'none' }}
                                                id="personal-photo-upload"
                                            />
                                            <label htmlFor="personal-photo-upload" style={{ cursor: 'pointer' }}>
                                                <div className='mt-10 pt-20 size-64 mx-auto border-gray-500 border-2 border-dashed rounded-2xl flex flex-col items-center'>
                                                    <FaCloudUploadAlt className='text-6xl text-blue-700' />
                                                    <p className='text-lg max-sm:text-base text-center mx-auto font-bold w-2/3 '>Drag and drop to upload image</p>
                                                </div>
                                            </label>
                                        </>
                                    )}
                                </Box>
                            </div>
                            <div>
                                <p className='font-semibold text-lg'>
                                    Ảnh CCCD mặt trước
                                </p>
                                <Box onDrop={(e) => handleDrop(e, 'cccdPhotoFront')} onDragOver={(e) => e.preventDefault()}>
                                    {localValues.cccdPhotoFront ? (
                                        <div className='relative'>
                                            <Button
                                                color='error'
                                                onClick={handleRemoveFile('cccdPhotoFront')}
                                                className='absolute top-[30%] left-[90%] text-red-500'
                                            >
                                                <FaTimes className='text-xl' />
                                            </Button>
                                            <img src={URL.createObjectURL(localValues.cccdPhotoFront)} alt="CCCD Front" className='size-64 mx-auto my-auto' />
                                        </div>
                                    ) : (
                                        <>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange('cccdPhotoFront')}
                                                style={{ display: 'none' }}
                                                id="cccd-front-upload"
                                            />
                                            <label htmlFor="cccd-front-upload" style={{ cursor: 'pointer' }}>
                                                <div className='mt-10 pt-20 size-64 mx-auto border-gray-500 border-2 border-dashed rounded-2xl flex flex-col items-center'>
                                                    <FaCloudUploadAlt className='text-6xl text-blue-700' />
                                                    <p className='text-lg max-sm:text-base text-center mx-auto font-bold w-2/3 '>Drag and drop to upload image</p>
                                                </div>
                                            </label>
                                        </>
                                    )}
                                </Box>
                            </div>
                            <div>
                                <p className='font-semibold text-lg'>
                                    Ảnh CCCD mặt sau
                                </p>
                                <Box onDrop={(e) => handleDrop(e, 'cccdPhotoBack')} onDragOver={(e) => e.preventDefault()}>
                                    {localValues.cccdPhotoBack ? (
                                        <div className='relative'>
                                            <Button
                                                color='error'
                                                onClick={handleRemoveFile('cccdPhotoBack')}
                                                className='absolute top-[30%] left-[90%] text-red-500'
                                            >
                                                <FaTimes className='text-xl' />
                                            </Button>
                                            <img src={URL.createObjectURL(localValues.cccdPhotoBack)} alt="CCCD Back" className='size-64 mx-auto my-auto' />
                                        </div>
                                    ) : (
                                        <>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange('cccdPhotoBack')}
                                                style={{ display: 'none' }}
                                                id="cccd-back-upload"
                                            />
                                            <label htmlFor="cccd-back-upload" style={{ cursor: 'pointer' }}>
                                                <div className='mt-10 pt-20 size-64 mx-auto border-gray-500 border-2 border-dashed rounded-2xl flex flex-col items-center'>
                                                    <FaCloudUploadAlt className='text-6xl text-blue-700' />
                                                    <p className='text-lg max-sm:text-base text-center mx-auto font-bold w-2/3 '>Drag and drop to upload image</p>
                                                </div>
                                            </label>
                                        </>
                                    )}
                                </Box>
                            </div>
                        </div>
                    ) : (
                        <div className='flex flex-col gap-5'>
                            <div>
                                <p className='font-semibold text-lg'>Ảnh cá nhân</p>
                                <img
                                    src={values.personalPhoto ? URL.createObjectURL(values.personalPhoto) : "https://img.freepik.com/premium-vector/default-image-icon-vector-missing-picture-page-website-design-mobile-app-no-photo-available_87543-11093.jpg?w=360"}
                                    alt="Personal"
                                    className='size-64 mx-auto my-auto'
                                />
                                {getFieldError('personalPhoto') && <Typography color="error">{getFieldError('personalPhoto')}</Typography>}
                            </div>
                            <div>
                                <p className='font-semibold text-lg'>Ảnh CCCD mặt trước</p>
                                <img
                                    src={values.cccdPhotoFront ? URL.createObjectURL(values.cccdPhotoFront) : "https://img.freepik.com/premium-vector/default-image-icon-vector-missing-picture-page-website-design-mobile-app-no-photo-available_87543-11093.jpg?w=360"}
                                    alt="CCCD Front"
                                    className='size-64 mx-auto my-auto'
                                />
                                {getFieldError('cccdPhotoFront') && <Typography color="error">{getFieldError('cccdPhotoFront')}</Typography>}
                            </div>
                            <div>
                                <p className='font-semibold text-lg'>Ảnh CCCD mặt sau</p>
                                <img
                                    src={values.cccdPhotoBack ? URL.createObjectURL(values.cccdPhotoBack) : "https://img.freepik.com/premium-vector/default-image-icon-vector-missing-picture-page-website-design-mobile-app-no-photo-available_87543-11093.jpg?w=360"}
                                    alt="CCCD Back"
                                    className='size-64 mx-auto my-auto'
                                />
                                {getFieldError('cccdPhotoBack') && <Typography color="error">{getFieldError('cccdPhotoBack')}</Typography>}
                            </div>
                        </div>
                    )}
                </div>
            )
        },
        {
            label: 'Gói đăng ký',
            fields: ['package'] as (keyof FormData)[],
            content: (
                <div className='mt-10'>
                    {editMode === 2 ? (
                        <>
                            <p className='font-semibold text-lg'>Chọn gói</p>
                            <div className='mx-auto w-fit'>
                                <RadioGroup
                                    row
                                    aria-label="package"
                                    name="package"
                                    value={localValues.package}
                                    onChange={(e) => setLocalValues({ ...localValues, package: e.target.value })}
                                >
                                    <FormControlLabel labelPlacement="bottom" value="Gói mặc định" control={<Radio />} label="Mặc định" />
                                    <FormControlLabel labelPlacement="bottom" value="Gói tên" control={<Radio />} label="Tên màu sắc" />
                                    <FormControlLabel labelPlacement="bottom" value="Gói tick xanh" control={<Radio />} label="Tick xanh" />
                                    <FormControlLabel labelPlacement="bottom" value="Gói VIP" control={<Radio />} label="VIP" />
                                </RadioGroup>
                            </div>
                        </>
                    ) : (
                        <div className='mx-auto w-fit'>
                            <p className='font-semibold text-lg'>Chọn gói</p>
                            <>
                                <RadioGroup
                                    row
                                    aria-label="package"
                                    name="package"
                                    value={localValues.package}
                                >
                                    <FormControlLabel labelPlacement="bottom" value="Gói mặc định" control={<Radio disabled />} label="Mặc định" />
                                    <FormControlLabel labelPlacement="bottom" value="Gói tên" control={<Radio disabled />} label="Tên màu sắc" />
                                    <FormControlLabel labelPlacement="bottom" value="Gói tick xanh" control={<Radio disabled />} label="Tick xanh" />
                                    <FormControlLabel labelPlacement="bottom" value="Gói VIP" control={<Radio disabled />} label="VIP" />
                                </RadioGroup>
                            </>
                        </div>
                    )}
                </div>
            )
        },
        {
            label: 'Ảnh giao dịch',
            fields: ['transactionImage'] as (keyof FormData)[],
            content: (
                <div>
                    {editMode === 3 ? (
                        <div>
                            <p className='font-semibold text-lg'>
                                Ảnh giao dịch
                            </p>
                            <Box onDrop={(e) => handleDrop(e, 'transactionImage')} onDragOver={(e) => e.preventDefault()}>
                                {localValues.transactionImage ? (
                                    <div className='relative'>
                                        <Button
                                            color='error'
                                            onClick={handleRemoveFile('transactionImage')}
                                            className='absolute top-[30%] left-[90%] text-red-500'
                                        >
                                            <FaTimes className='text-xl' />
                                        </Button>
                                        <img src={URL.createObjectURL(localValues.transactionImage)} alt="Transaction" className='size-64 mx-auto my-auto' />
                                    </div>
                                ) : (
                                    <>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange('transactionImage')}
                                            style={{ display: 'none' }}
                                            id="transaction-image-upload"
                                        />
                                        <label htmlFor="transaction-image-upload" style={{ cursor: 'pointer' }}>
                                            <div className='mt-10 pt-20 size-64 mx-auto border-gray-500 border-2 border-dashed rounded-2xl flex flex-col items-center'>
                                                <FaCloudUploadAlt className='text-6xl text-blue-700' />
                                                <p className='text-lg max-sm:text-base text-center mx-auto font-bold w-2/3 '>Drag and drop to upload image</p>
                                            </div>
                                        </label>
                                    </>
                                )}
                            </Box>
                        </div>
                    ) : (
                        <div>
                            <p className='font-semibold text-lg'>Ảnh giao dịch</p>
                            <img
                                src={values.transactionImage ? URL.createObjectURL(values.transactionImage) : "https://img.freepik.com/premium-vector/default-image-icon-vector-missing-picture-page-website-design-mobile-app-no-photo-available_87543-11093.jpg?w=360"}
                                alt="Transaction"
                                className='size-64 mx-auto my-auto'
                            />
                            {getFieldError('transactionImage') && <Typography color="error">{getFieldError('transactionImage')}</Typography>}
                        </div>
                    )}
                </div>
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

    const handleEdit = (index: number) => {
        setEditMode(index);
        setLocalValues(values);
    };

    const handleCancel = () => {
        setEditMode(null);
        setLocalValues(values);
    };

    const handleSave = () => {
        setEditMode(null);
        setValues(localValues);
    };

    return (
        <div className='bg-[#fefefe] p-10 rounded-md '>
            <div className='flex gap-5 mb-20'>

                <p className='text-5xl max-sm:text-2xl font-bold w-fit text-center'>Review thông tin đăng ký</p>
                <Tooltip title="Nếu bạn muốn chỉnh sửa lại các trường thông tin, ấn vào biểu tượng bên cạnh">
                    <IconButton>
                        <QuestionMarkIcon className='text-black' />
                    </IconButton>
                </Tooltip>

            </div>

            {steps.map((step, index) => (
                <Accordion
                    key={index}
                    expanded={expanded.includes(index)}
                    onChange={() => handleAccordionChange(index)}
                    className='mb-5'>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} style={{ backgroundColor: isStepValid(step.fields) ? '#00ba37' : '#F63638' }}>
                        <Typography className='flex items-center text-white text-xl'>
                            {isStepValid(step.fields) ? (
                                <FaCheckCircle className='mr-2' />
                            ) : (
                                <FaTimesCircle className=' mr-2' />
                            )}
                            Step {index + 1}: {step.label}
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails className='flex flex-col justify-between gap-5'>
                        {step.content}
                        {editMode === index ? (
                            <div className='flex gap-2 ml-auto'>
                                <Button variant="contained" color="primary" onClick={handleSave}>
                                    <FaSave className='mr-2' /> Save
                                </Button>
                                <Button variant="outlined" color="secondary" onClick={handleCancel}>
                                    <FaTimes className='mr-2' /> Cancel
                                </Button>
                            </div>
                        ) : (
                            <FaEdit onClick={() => handleEdit(index)} className='cursor-pointer ml-auto text-2xl' />
                        )}
                    </AccordionDetails>
                </Accordion>
            ))}
        </div>
    );
};

export default Step5Review;
