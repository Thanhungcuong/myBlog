import React from 'react';
import { Box, Typography, Avatar, Button } from '@mui/material';

interface Props {
    handleFileChange: (input: string) => (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => void;
    values: { personalPhoto: File | null; cccdPhotoFront: File | null; cccdPhotoBack: File | null };
}

const Step2Image: React.FC<Props> = ({ handleFileChange, values }) => {
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

    const modalStyle = {
        position: 'relative' as 'relative',
        width: '100%',
        boxShadow: 24,
        p: 4,
        textAlign: 'center' as 'center',
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, input: string) => {
        e.preventDefault();
        handleFileChange(input)(e);
    };

    return (
        <div>
            <h2 className='text-2xl font-bold mx-auto w-fit '>Upload ảnh cá nhân và CCCD</h2>
            <form className='flex flex-col gap-10' action="">
                <div>
                    <Typography className='mb-2' variant="h6" component="h2">Ảnh cá nhân</Typography>
                    <Box
                        sx={modalStyle}
                        onDrop={(e) => handleDrop(e, 'personalPhoto')}
                        onDragOver={(e) => e.preventDefault()}
                    >

                        {previewPersonalPhoto ? (
                            <img src={previewPersonalPhoto} alt="Personal" className='mx-auto' />
                        ) : (
                            <>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange('personalPhoto')}
                                    style={{ display: 'none' }}
                                    id="personal-photo-upload"
                                />
                                <label htmlFor="personal-photo-upload" style={{ cursor: 'pointer' }}>
                                    <div
                                        style={{
                                            border: '2px dashed gray',
                                            borderRadius: '4px',
                                            padding: '20px',
                                        }}
                                    >
                                        Kéo và thả ảnh vào đây hoặc nhấn để chọn
                                    </div>
                                </label>
                            </>
                        )}
                    </Box>
                </div>

                <div>
                    <Typography className='mb-2' variant="h6" component="h2">Ảnh mặt trước CCCD</Typography>
                    <Box
                        sx={modalStyle}
                        onDrop={(e) => handleDrop(e, 'cccdPhotoFront')}
                        onDragOver={(e) => e.preventDefault()}
                    >

                        {previewCccdFront ? (
                            <img src={previewCccdFront} alt="CCCD Front" className='mx-auto' />
                        ) : (
                            <>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange('cccdPhotoFront')}
                                    style={{ display: 'none' }}
                                    id="cccd-front-upload"
                                />
                                <label htmlFor="cccd-front-upload" style={{ cursor: 'pointer' }}>
                                    <div
                                        style={{
                                            border: '2px dashed gray',
                                            borderRadius: '4px',
                                            padding: '20px',
                                        }}
                                    >
                                        Kéo và thả ảnh vào đây hoặc nhấn để chọn
                                    </div>
                                </label>
                            </>
                        )}
                    </Box>
                </div>

                <div>

                    <Typography className='mb-2' variant="h6" component="h2">Ảnh mặt sau CCCD</Typography>
                    <Box
                        sx={modalStyle}
                        onDrop={(e) => handleDrop(e, 'cccdPhotoBack')}
                        onDragOver={(e) => e.preventDefault()}
                    >

                        {previewCccdBack ? (
                            <img src={previewCccdBack} alt="CCCD Back" className='mx-auto' />
                        ) : (
                            <>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange('cccdPhotoBack')}
                                    style={{ display: 'none' }}
                                    id="cccd-back-upload"
                                />
                                <label htmlFor="cccd-back-upload" style={{ cursor: 'pointer' }}>
                                    <div
                                        style={{
                                            border: '2px dashed gray',
                                            borderRadius: '4px',
                                            padding: '20px',
                                        }}
                                    >
                                        Kéo và thả ảnh vào đây hoặc nhấn để chọn
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
