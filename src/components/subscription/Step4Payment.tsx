import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { FaCloudUploadAlt, FaTimes } from 'react-icons/fa';
import StepperSubscription from '../stepper/StepperSubscription';
interface Props {
    handleFileChange: (input: string) => (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => void;
    values: { transactionImage: File | null };
    handleRemoveFile: (input: string) => () => void;
}

const Step4Payment: React.FC<Props> = ({ handleFileChange, values, handleRemoveFile }) => {
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

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, input: string) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileChange(input)(e as any);
        }
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
                    <StepperSubscription step={4} />
                </div>
                <div className='xl:hidden flex gap-2 items-center'>
                    <div className='my-10 size-10 flex justify-center items-center  bg-blue-400 text-white rounded-full'>
                        1
                    </div>
                    {renderStepperMobi(4)}
                    <p className='text-lg text-blue-700'>/ 5 Step</p>
                </div>
            </div>
            <Box sx={{ p: 3 }}>
                <p className='text-5xl max-sm:text-2xl font-bold w-fit mx-auto mb-10'>
                    Payment
                </p>
                <div>
                    <Typography className='mb-2' variant="h6" component="h2">Transaction image</Typography>
                    <Box
                        onDrop={(e) => handleDrop(e, 'transactionImage')}
                        onDragOver={(e) => e.preventDefault()}
                    >
                        {previewTransactionImage ? (
                            <div className='relative'>
                                <Button
                                    color='error'
                                    onClick={handleRemoveFile('transactionImage')}
                                    className='absolute top-[30%] left-[90%] text-red-500'
                                >
                                    <FaTimes className='text-xl' />
                                </Button>
                                <img src={previewTransactionImage} alt="Transaction Preview" className='mx-auto' style={{ maxWidth: '100%', height: 'auto' }} />
                            </div>
                        ) : (
                            <>
                                <input
                                    required
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange('transactionImage')}
                                    style={{ display: 'none' }}
                                    id="transaction-image-upload"
                                />
                                <label htmlFor="transaction-image-upload" style={{ cursor: 'pointer' }}>
                                    <div className='mt-10 sm:p-20 max-sm:w-[200px] max-sm:h-[300px] max-sm:pt-20 max-sm:mx-auto border-gray-500 border-2 border-dashed rounded-2xl flex flex-col items-center'>
                                        <FaCloudUploadAlt className='text-6xl text-blue-700' />
                                        <p className='text-lg text-center font-bold mx-auto max-sm:w-2/3'>Drag and drop to upload image</p>
                                    </div>
                                </label>
                            </>
                        )}
                    </Box>
                </div>

            </Box>
        </div>
    );
};

export default Step4Payment;
