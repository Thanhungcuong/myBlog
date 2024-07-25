import React from 'react';
import { Box, Button, Typography, Modal } from '@mui/material';
import { useFormContext } from 'react-hook-form';

interface EditCoverPhotoUrlProps {
    open: boolean;
    onClose: () => void;
    previewCoverPhoto: string | null;
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

const EditCoverPhotoUrl: React.FC<EditCoverPhotoUrlProps> = ({ open, onClose, previewCoverPhoto, handleFileChange, handleSave }) => {
    const { formState: { errors } } = useFormContext();

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="modal-cover-title"
            aria-describedby="modal-cover-description"
        >
            <Box
                sx={modalStyle}
                onDrop={(e) => {
                    e.preventDefault();
                    handleFileChange(e as React.DragEvent<HTMLDivElement>);
                }}
                onDragOver={(e) => e.preventDefault()}
            >
                <Typography id="modal-cover-title" variant="h6" component="h2">
                    Chỉnh sửa ảnh bìa
                </Typography>

                {previewCoverPhoto ? (
                    <img src={previewCoverPhoto} alt="cover preview" style={{ width: '100%', marginTop: 20 }} />
                ) : (
                    <>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                            id="cover-upload"
                        />
                        <label htmlFor="cover-upload" style={{ cursor: 'pointer' }}>
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
                {errors.coverPhotoFile && <p>{errors.coverPhotoFile as any}</p>}
            </Box>
        </Modal>
    );
};

export default EditCoverPhotoUrl;
