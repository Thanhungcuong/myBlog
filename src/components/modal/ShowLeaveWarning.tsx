import React from 'react';
import { Box, Button, Modal, Typography } from '@mui/material';

interface ShowLeaveWarningProps {
    open: boolean;
    onLeave: () => void;
    onStay: () => void;
}

const modalStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

const ShowLeaveWarning: React.FC<ShowLeaveWarningProps> = ({ open, onLeave, onStay }) => {
    return (
        <Modal
            open={open}
            onClose={onStay}
            aria-labelledby="leave-warning-title"
            aria-describedby="leave-warning-description"
        >
            <Box sx={modalStyle}>
                <Typography id="leave-warning-title" variant="h6" component="h2">
                    Bạn có chắc chắn muốn rời đi?
                </Typography>
                <Typography id="leave-warning-description" sx={{ mt: 2 }}>
                    Bạn có thay đổi chưa được lưu. Nếu bạn rời khỏi trang này, bạn sẽ mất các thay đổi của mình.
                </Typography>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
                    <Button onClick={onLeave} variant="contained" color="secondary">
                        Rời đi
                    </Button>
                    <Button onClick={onStay} variant="contained" color="primary">
                        Ở lại
                    </Button>
                </div>
            </Box>
        </Modal>
    );
};

export default ShowLeaveWarning;
