import React from 'react';
import { Box, Button, Avatar, Typography, Modal } from '@mui/material';
import { useFormContext } from 'react-hook-form';

interface EditAvatarProps {
    open: boolean;
    onClose: () => void;
    previewAvatar: string | null;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => void;
    handleSave: () => void;
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

const EditAvatar: React.FC<EditAvatarProps> = ({ open, onClose, previewAvatar, handleFileChange, handleSave }) => {
    const { formState: { errors } } = useFormContext();

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="modal-avatar-title"
            aria-describedby="modal-avatar-description"
        >
            <Box
                sx={modalStyle}
                onDrop={(e) => {
                    e.preventDefault();
                    handleFileChange(e as React.DragEvent<HTMLDivElement>);
                }}
                onDragOver={(e) => e.preventDefault()}
            >
                <Typography id="modal-avatar-title" variant="h6" component="h2">
                    Chỉnh sửa ảnh đại diện
                </Typography>

                {previewAvatar ? (
                    <Avatar
                        src={previewAvatar}
                        alt="avatar preview"
                        sx={{ width: 200, height: 200, margin: '20px auto' }}
                    />
                ) : (
                    <>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                            id="avatar-upload"
                        />
                        <label htmlFor="avatar-upload" style={{ cursor: 'pointer' }}>
                            <div
                                style={{
                                    border: '2px dashed gray',
                                    borderRadius: '4px',
                                    padding: '20px',
                                    textAlign: 'center',
                                }}
                            >
                                Kéo và thả ảnh vào đây hoặc nhấn để chọn
                            </div>
                        </label>
                    </>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
                    <Button onClick={onClose} variant="contained" color="secondary">
                        Hủy
                    </Button>
                    <Button onClick={handleSave} variant="contained" color="primary">
                        Lưu
                    </Button>
                </div>
                {errors.avatarFile && <p>{errors.avatarFile as any}</p>}
            </Box>
        </Modal>
    );
};

export default EditAvatar;
