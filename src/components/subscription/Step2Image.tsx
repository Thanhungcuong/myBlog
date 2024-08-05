import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { FaCloudUploadAlt, FaTimes } from "react-icons/fa";
import StepperSubscription from '../stepper/StepperSubscription';

interface Props {
    handleFileChange: (input: string) => (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement> | { target: { files: File[] } }) => void;
    values: { personalPhoto: File | null; cccdPhotoFront: File | null; cccdPhotoBack: File | null };
    handleRemoveFile: (input: string) => () => void;
}

const Step2Image: React.FC<Props> = ({ handleFileChange, values, handleRemoveFile }) => {
    const [previewPersonalPhoto, setPreviewPersonalPhoto] = React.useState<string | null>(null);
    const [previewCccdFront, setPreviewCccdFront] = React.useState<string | null>(null);
    const [previewCccdBack, setPreviewCccdBack] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (values.personalPhoto) {
            const reader = new FileReader();
            reader.onloadend = () => setPreviewPersonalPhoto(reader.result as string);
            reader.readAsDataURL(values.personalPhoto);
        } else {
            setPreviewPersonalPhoto(null);
        }
        if (values.cccdPhotoFront) {
            const reader = new FileReader();
            reader.onloadend = () => setPreviewCccdFront(reader.result as string);
            reader.readAsDataURL(values.cccdPhotoFront);
        } else {
            setPreviewCccdFront(null);
        }
        if (values.cccdPhotoBack) {
            const reader = new FileReader();
            reader.onloadend = () => setPreviewCccdBack(reader.result as string);
            reader.readAsDataURL(values.cccdPhotoBack);
        } else {
            setPreviewCccdBack(null);
        }
    }, [values.personalPhoto, values.cccdPhotoFront, values.cccdPhotoBack]);

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, input: string) => {
        e.preventDefault();
        handleFileChange(input)(e);
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
        <div className='bg-white shadow-lg border-t-2 p-10 rounded-md'>
            <div>
                <div className='max-xl:hidden'>
                    <StepperSubscription step={1} />
                </div>
                <div className='xl:hidden flex gap-2 items-center'>
                    <div className='my-10 size-10 flex justify-center items-center  bg-blue-400 text-white rounded-full'>
                        2
                    </div>
                    {renderStepperMobi(2)}
                    <p className='text-lg text-blue-700'>/ 5 Step</p>
                </div>
            </div>
            <h2 className='text-2xl font-bold mx-auto w-fit '>Upload idividual image and citizen identification card</h2>
            <form className='flex flex-col gap-10' action="">
                <div className='mt-10'>
                    <Typography className='mb-2' variant="h6" component="h2">Idividual image</Typography>
                    <Box onDrop={(e) => handleDrop(e, 'personalPhoto')} onDragOver={(e) => e.preventDefault()}>
                        {previewPersonalPhoto ? (
                            <div className='relative'>
                                <Button
                                    color='error'
                                    onClick={handleRemoveFile('personalPhoto')}
                                    className='absolute top-[30%] left-[90%] text-red-500'
                                >
                                    <FaTimes className='text-xl' />
                                </Button>
                                <img src={previewPersonalPhoto} alt="Personal" className='mx-auto my-10' />

                            </div>
                        ) : (
                            <>
                                <input
                                    required
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange('personalPhoto')}
                                    style={{ display: 'none' }}
                                    id="personal-photo-upload"
                                />
                                <label htmlFor="personal-photo-upload" style={{ cursor: 'pointer' }}>
                                    <div className='mt-10 sm:p-20 max-sm:w-[200px] max-sm:h-[300px] max-sm:pt-20 max-sm:mx-auto border-gray-500 border-2 border-dashed rounded-2xl flex flex-col items-center'>
                                        <FaCloudUploadAlt className='text-6xl text-blue-700' />
                                        <p className='text-lg max-sm:text-base text-center mx-auto font-bold max-sm:w-2/3 '>Drag and drop to upload image</p>
                                    </div>
                                </label>
                            </>
                        )}
                    </Box>
                </div>

                <div>
                    <Typography className='mb-2' variant="h6" component="h2">Front photo of citizen identification card</Typography>
                    <Box onDrop={(e) => handleDrop(e, 'cccdPhotoFront')} onDragOver={(e) => e.preventDefault()}>
                        {previewCccdFront ? (
                            <div className='relative'>
                                <Button
                                    color='error'
                                    onClick={handleRemoveFile('cccdPhotoFront')}
                                    className='absolute top-[30%] left-[90%] text-red-500'
                                >
                                    <FaTimes className='text-xl' />
                                </Button>
                                <img src={previewCccdFront} alt="CCCD Front" className='mx-auto my-10' />

                            </div>
                        ) : (
                            <>
                                <input
                                    required
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange('cccdPhotoFront')}
                                    style={{ display: 'none' }}
                                    id="cccd-front-upload"
                                />
                                <label htmlFor="cccd-front-upload" style={{ cursor: 'pointer' }}>
                                    <div className='mt-10 sm:p-20 max-sm:w-[200px] max-sm:h-[300px] max-sm:pt-20 max-sm:mx-auto border-gray-500 border-2 border-dashed rounded-2xl flex flex-col items-center'>
                                        <FaCloudUploadAlt className='text-6xl text-blue-700' />
                                        <p className='text-lg max-sm:text-base text-center mx-auto font-bold max-sm:w-2/3 '>Drag and drop to upload image</p>
                                    </div>
                                </label>
                            </>
                        )}
                    </Box>
                </div>

                <div>
                    <Typography className='mb-2' variant="h6" component="h2">Back photo of citizen identification card</Typography>
                    <Box onDrop={(e) => handleDrop(e, 'cccdPhotoBack')} onDragOver={(e) => e.preventDefault()}>
                        {previewCccdBack ? (
                            <div className='relative'>
                                <Button
                                    color='error'
                                    onClick={handleRemoveFile('cccdPhotoBack')}
                                    className='absolute top-[30%] left-[90%] text-red-500'
                                >
                                    <FaTimes className='text-xl' />
                                </Button>
                                <img src={previewCccdBack} alt="CCCD Back" className='mx-auto my-10' />

                            </div>
                        ) : (
                            <>
                                <input
                                    required
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange('cccdPhotoBack')}
                                    style={{ display: 'none' }}
                                    id="cccd-back-upload"
                                />
                                <label htmlFor="cccd-back-upload" style={{ cursor: 'pointer' }}>
                                    <div className='mt-10 sm:p-20 max-sm:w-[200px] max-sm:h-[300px] max-sm:pt-20 max-sm:mx-auto border-gray-500 border-2 border-dashed rounded-2xl flex flex-col items-center'>
                                        <FaCloudUploadAlt className='text-6xl text-blue-700' />
                                        <p className='text-lg text-center font-bold mx-auto max-sm:w-2/3'>Drag and drop to upload image</p>
                                    </div>
                                </label>
                            </>
                        )}
                    </Box>
                </div>
            </form>
        </div>
    );
};

export default Step2Image;
