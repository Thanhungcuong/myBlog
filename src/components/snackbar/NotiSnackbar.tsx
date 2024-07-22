import React from 'react';
import { Snackbar, SnackbarProps, Button } from '@mui/material';

interface ClickableSnackbarProps extends SnackbarProps {
    onClick: () => void;
}

const NotiSnackBar: React.FC<ClickableSnackbarProps> = ({ onClick, ...props }) => {
    return (
        <Snackbar
            {...props}
            action={
                <Button color="inherit" onClick={onClick}>
                    View Post
                </Button>
            }
        />
    );
};

export default NotiSnackBar;
