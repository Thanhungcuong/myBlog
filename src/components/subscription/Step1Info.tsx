import React from 'react';
import { Box, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import StepperSubscription from '../stepper/StepperSubscription';

interface Props {
    handleChange: (input: string) => (e: React.ChangeEvent<HTMLInputElement>) => void;
    values: { name: string; email: string; phone: string };
}

const Step1Info: React.FC<Props> = ({ handleChange, values }) => {
    const { t } = useTranslation();

    const renderStepperMobi = (step: number) => {
        switch (step) {
            case 1:
                return <p className='text-lg text-blue-700'>{t('step1Info.step1')}</p>;
            case 2:
                return <p className='text-lg text-blue-700'>{t('step1Info.step2')}</p>;
            case 3:
                return <p className='text-lg text-blue-700'>{t('step1Info.step3')}</p>;
            case 4:
                return <p className='text-lg text-blue-700'>{t('step1Info.step4')}</p>;
            case 5:
                return <p className='text-lg text-blue-700'>{t('step1Info.step5')}</p>;
            default:
                return null;
        }
    };

    return (
        <Box className='max-w-[1440px] mx-auto border-t-2 bg-white shadow-lg p-10 rounded-md'>
            <div>
                <div className='max-xl:hidden'>
                    <StepperSubscription step={1} />
                </div>
                <div className='xl:hidden flex gap-2 items-center '>
                    <div className='my-10 size-10 flex justify-center items-center bg-blue-400 text-white rounded-full'>
                        1
                    </div>
                    {renderStepperMobi(1)}
                    <p className='text-lg text-blue-700'>/ 5 {t('step1Info.step5')}</p>
                </div>
            </div>
            <Typography variant="h4" component="h2" className='font-bold mb-12'>
                {t('step1Info.infoTitle')}
            </Typography>
            <form className='flex flex-col gap-10 mt-10'>
                <Box>
                    <Typography variant="subtitle1" component="label" htmlFor="name">
                        {t('step1Info.nameLabel')}
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
                        {t('step1Info.emailLabel')}
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
                        {t('step1Info.phoneLabel')}
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
