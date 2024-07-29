import { TextField } from '@mui/material';
import React from 'react';


interface Props {

    handleChange: (input: string) => (e: React.ChangeEvent<HTMLInputElement>) => void;
    values: { name: string; email: string; phone: string };
}

const Step1Info: React.FC<Props> = ({ handleChange, values }) => {


    return (
        <div className='max-w-[1440px] mx-auto'>
            <h2 className='text-2xl font-bold mx-auto w-fit mb-12'>Thông tin cá nhân</h2>
            <form className='flex flex-col gap-10' action="">

                <TextField
                    required
                    id="outlined-basic"
                    label="Họ và tên"
                    variant="outlined"

                    value={values.name}
                    onChange={handleChange('name')}

                />
                <TextField
                    required
                    id="outlined-basic"
                    label="Email"
                    variant="outlined"

                    value={values.email}
                    onChange={handleChange('email')}

                />
                <TextField
                    required
                    id="outlined-basic"
                    label="Phone"
                    variant="outlined"
                    value={values.phone}
                    onChange={handleChange('phone')}

                />
            </form>

        </div>
    );
};

export default Step1Info;
