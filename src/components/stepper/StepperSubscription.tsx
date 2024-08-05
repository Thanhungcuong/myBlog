import * as React from 'react';
import Box from '@mui/material/Box';
import { Stepper } from '@mui/material';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';


interface StepperProps {
  step: number;


}

const StepperSubscription: React.FC<StepperProps> = ({ step }) => {
  const steps = ['Step 1: Infomation', 'Step 2: Personal Image', 'Step 3: Subscription', 'Step 4: Transaction Photo', 'Step 5: Review and Confirm'];
  return (
    <div className='my-10'>

      <Box sx={{ width: '100%' }}>
        <Stepper activeStep={step - 1}>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
    </div>

  );
}

export default StepperSubscription