import React from 'react';
import { Box, TextField, Typography } from '@mui/material';
import StepperSubscription from '../stepper/StepperSubscription';

interface Props {
    handleChange: (input: string) => (e: React.ChangeEvent<HTMLInputElement>) => void;
    values: { name: string; email: string; phone: string };
}

const Step1Info: React.FC<Props> = ({ handleChange, values }) => {
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
        <Box className='max-w-[1440px] mx-auto border-t-2 bg-white shadow-lg p-10 rounded-md'>
            <div>
                <div className='max-xl:hidden'>
                    <StepperSubscription step={1} />
                </div>
                <div className='xl:hidden flex gap-2 items-center'>
                    <div className='my-10 size-10 flex justify-center items-center  bg-blue-400 text-white rounded-full'>
                        1
                    </div>
                    {renderStepperMobi(1)}
                    <p className='text-lg text-blue-700'>/ 5 Step</p>
                </div>
            </div>
            <Typography variant="h4" component="h2" className='font-bold mb-12'>
                Infomation
            </Typography>


            <form className='flex flex-col gap-10 mt-10'>
                <Box>
                    <Typography variant="subtitle1" component="label" htmlFor="name">
                        Name
                    </Typography>
                    <TextField
                        id="name"
                        variant="outlined"
                        value={values.name}
                        onChange={handleChange('name')}
                        required
                        fullWidth
                        margin="normal"
                    />
                </Box>
                <Box>
                    <Typography variant="subtitle1" component="label" htmlFor="email">
                        Email
                    </Typography>
                    <TextField
                        id="email"
                        variant="outlined"
                        value={values.email}
                        onChange={handleChange('email')}
                        required
                        fullWidth
                        margin="normal"
                    />
                </Box>
                <Box>
                    <Typography variant="subtitle1" component="label" htmlFor="phone">
                        Phone
                    </Typography>
                    <TextField
                        id="phone"
                        variant="outlined"
                        value={values.phone}
                        onChange={handleChange('phone')}
                        required
                        fullWidth
                        margin="normal"
                    />
                </Box>
            </form>
        </Box>
    );
};

export default Step1Info;
