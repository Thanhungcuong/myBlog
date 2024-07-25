import React from 'react';
import { TextField, Button, Modal, Box, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EditProfileSchema } from '../../constant/schema';

interface UserProfile {
    email: string;
    uid: string;
    role: string;
    loginMethod: string;
    name: string;
    avatar: string;
    coverPhotoUrl: string | null;
    bio: string | null;
    birthday: string | null;
}

interface EditProfileFormProps {
    userProfile: UserProfile;
    isEditing: {
        name: boolean;
        avatar: boolean;
        coverPhotoUrl: boolean;
    };
    handleEditToggle: (field: 'avatar' | 'coverPhotoUrl' | 'name') => void;
    handleFileChange: (
        e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>,
        field: 'avatar' | 'coverPhotoUrl'
    ) => void;
    handleSave: (data: any) => Promise<void>;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({
    userProfile,
    isEditing,
    handleEditToggle,
    handleFileChange,
    handleSave,
}) => {
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(EditProfileSchema),
    });

    return (
        <form onSubmit={handleSubmit((data) => handleSave({
            ...data,
            name: data.tempName || userProfile.name,
            bio: data.tempBio || userProfile.bio,
            birthday: data.tempBirthday || userProfile.birthday,
        }))}>
            <div className='flex flex-col gap-4 w-full'>
                <div className='my-5 h-10 flex flex-col mb-10'>
                    <label className='font-bold text-xl mb-4'>Name:</label>
                    <TextField
                        {...register("tempName")}
                        defaultValue={userProfile.name}
                        error={!!errors.tempName}
                        helperText={errors.tempName?.message?.toString()}
                        fullWidth
                    />
                </div>

                <div className='mt-5 flex flex-col'>
                    <label className='font-bold text-xl mb-2'>Bio:</label>
                    <TextField
                        {...register("tempBio")}
                        defaultValue={userProfile.bio}
                        multiline
                        rows={3}
                        error={!!errors.tempBio}
                        helperText={errors.tempBio?.message?.toString()}
                        fullWidth
                    />
                </div>

                <div className='mb-5 flex flex-col'>
                    <label className='font-bold text-xl mb-2'>Birthday:</label>
                    <TextField
                        type="date"
                        {...register("tempBirthday")}
                        defaultValue={userProfile.birthday || ''}
                        error={!!errors.tempBirthday}
                        helperText={errors.tempBirthday?.message?.toString()}
                        fullWidth
                    />
                </div>

                <div className='flex justify-between'>
                    <Button
                        className='flex gap-4 p-6 bg-gray-800 mr-auto rounded-lg items-center shadow-lg w-50'
                        type="button"
                        onClick={() => handleEditToggle('avatar')}
                    >
                        Edit Avatar
                    </Button>
                    <Button
                        className='flex gap-4 p-6 bg-gray-800 mr-auto rounded-lg items-center shadow-lg w-50'
                        type="button"
                        onClick={() => handleEditToggle('coverPhotoUrl')}
                    >
                        Edit Cover Photo
                    </Button>
                    <Button variant="contained" color="primary" type="submit">
                        Save
                    </Button>
                </div>
            </div>

            <Modal
                open={isEditing.avatar}
                onClose={() => handleEditToggle('avatar')}
                aria-labelledby="modal-avatar-title"
                aria-describedby="modal-avatar-description"
            >
                <Box
                    sx={modalStyle}
                    onDrop={(e) => {
                        e.preventDefault();
                        handleFileChange(e as React.DragEvent<HTMLDivElement>, 'avatar');
                    }}
                    onDragOver={(e) => e.preventDefault()}
                >
                    <Typography id="modal-avatar-title" variant="h6" component="h2">
                        Edit Avatar
                    </Typography>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'avatar')}
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
                            Drag and drop image here or click to select
                        </div>
                    </label>
                    <Button variant="contained" color="primary" type="submit">
                        Save
                    </Button>
                </Box>
            </Modal>

            <Modal
                open={isEditing.coverPhotoUrl}
                onClose={() => handleEditToggle('coverPhotoUrl')}
                aria-labelledby="modal-cover-title"
                aria-describedby="modal-cover-description"
            >
                <Box
                    sx={modalStyle}
                    onDrop={(e) => {
                        e.preventDefault();
                        handleFileChange(e as React.DragEvent<HTMLDivElement>, 'coverPhotoUrl');
                    }}
                    onDragOver={(e) => e.preventDefault()}
                >
                    <Typography id="modal-cover-title" variant="h6" component="h2">
                        Edit Cover Photo
                    </Typography>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'coverPhotoUrl')}
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
                            Drag and drop image here or click to select
                        </div>
                    </label>
                    <Button variant="contained" color="primary" type="submit">
                        Save
                    </Button>
                </Box>
            </Modal>
        </form>
    );
};

const modalStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
};

export default EditProfileForm;
