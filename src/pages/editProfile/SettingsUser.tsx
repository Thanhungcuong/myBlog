import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { db, storage } from '../../firebaseConfig';
import { FaPencilAlt, FaArrowCircleLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Avatar, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Modal, Box, Typography } from '@mui/material';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import SettingsSkeleton from '../../components/skeleton/SettingsSkeleton';
import { EditProfileSchema } from '../../constant/schema/edit';
import * as z from 'zod';


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

const SettingsUser: React.FC = () => {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isEditing, setIsEditing] = useState({
        name: false,
        avatar: false,
        coverPhotoUrl: false,
    });

    const [tempName, setTempName] = useState<string>('');
    const [tempBio, setTempBio] = useState<string>('');
    const [tempBirthday, setTempBirthday] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [coverPhotoFile, setCoverPhotoFile] = useState<File | null>(null);
    const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
    const [previewCoverPhoto, setPreviewCoverPhoto] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
    const [showLeaveWarning, setShowLeaveWarning] = useState<boolean>(false);
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
    const navigate = useNavigate();

    const uid = localStorage.getItem('uid');

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!uid) {
                setError('User is not logged in.');
                return;
            }

            try {
                const userRef = doc(db, 'users', uid);
                const userDoc = await getDoc(userRef);

                if (userDoc.exists()) {
                    const data = userDoc.data() as UserProfile;
                    setUserProfile(data);
                    setTempName(data.name);
                    setTempBio(data.bio || '');
                    setTempBirthday(data.birthday || null);
                    setIsLoading(false);
                } else {
                    setError('User does not exist.');
                }
            } catch (err) {
                console.error('Error fetching user profile:', err);
                setError('Failed to fetch user profile.');
                setIsLoading(false);
            }
        };

        fetchUserProfile();
    }, [uid]);

    const handleEditToggle = (field: keyof typeof isEditing) => {
        setIsEditing(prevState => ({
            ...prevState,
            [field]: !prevState[field]
        }));
        if (field === 'name' && userProfile) {
            setTempName(userProfile.name);
        }
        if (field === 'avatar') {
            setPreviewAvatar(null);
            setAvatarFile(null);
        }
        if (field === 'coverPhotoUrl') {
            setPreviewCoverPhoto(null);
            setCoverPhotoFile(null);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: keyof UserProfile) => {
        setHasUnsavedChanges(true);
        if (validationErrors[field]) {
            const newValidationErrors = { ...validationErrors };
            delete newValidationErrors[field];
            setValidationErrors(newValidationErrors);

        }
        if (field === 'name') {
            setTempName(e.target.value);
        }
    };

    const handleBioChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setHasUnsavedChanges(true);
        setValidationErrors({});
        setTempBio(e.target.value);
    };

    const handleBirthdayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setHasUnsavedChanges(true);
        setValidationErrors({});
        const newBirthday = e.target.value || null;
        setTempBirthday(newBirthday);
    };

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>,
        field: 'avatar' | 'coverPhotoUrl'
    ) => {
        setHasUnsavedChanges(true);
        setValidationErrors({});

        let files: FileList | null = null;

        if ('dataTransfer' in e) {
            if (e.dataTransfer) {
                files = e.dataTransfer.files;
            }
        } else {
            files = e.target.files;
        }

        if (files && files.length > 0) {
            const file = files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                if (field === 'avatar') {
                    setAvatarFile(file);
                    setPreviewAvatar(reader.result as string);
                } else if (field === 'coverPhotoUrl') {
                    setCoverPhotoFile(file);
                    setPreviewCoverPhoto(reader.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const validateForm = async () => {
        try {
            await EditProfileSchema.parseAsync({
                tempName: tempName,
                tempBio: tempBio,
                tempBirthday: tempBirthday,
                avatarFile: avatarFile,
                coverPhotoFile: coverPhotoFile,
            });
            setValidationErrors({});
            return true;
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errors: { [key: string]: string } = {};
                error.errors.forEach((err) => {
                    if (err.path.length > 0) {
                        errors[err.path[0]] = err.message;
                    }
                });
                setValidationErrors(errors);
            }
            return false;
        }
    };




    const handleSave = async () => {
        const isValid = await validateForm();
        if (!isValid) return;
        if (userProfile) {
            setIsLoading(true);
            try {
                if (avatarFile) {
                    const storageRef = ref(storage, `avatars/${uid}/${avatarFile.name}`);
                    await uploadBytes(storageRef, avatarFile);
                    const downloadURL = await getDownloadURL(storageRef);
                    await updateDoc(doc(db, 'users', uid!), {
                        avatar: downloadURL,
                    });
                    setUserProfile({
                        ...userProfile,
                        avatar: downloadURL,
                    });
                    setAvatarFile(null);
                    setPreviewAvatar(null);
                    setIsEditing(prevState => ({
                        ...prevState,
                        avatar: false
                    }));
                }
                if (coverPhotoFile) {
                    const storageRef = ref(storage, `coverPhotos/${uid}/${coverPhotoFile.name}`);
                    await uploadBytes(storageRef, coverPhotoFile);
                    const downloadURL = await getDownloadURL(storageRef);
                    await updateDoc(doc(db, 'users', uid!), {
                        coverPhotoUrl: downloadURL,
                    });
                    setUserProfile({
                        ...userProfile,
                        coverPhotoUrl: downloadURL,
                    });
                    setCoverPhotoFile(null);
                    setPreviewCoverPhoto(null);
                    setIsEditing(prevState => ({
                        ...prevState,
                        coverPhotoUrl: false
                    }));
                }
                if (tempName !== userProfile.name) {
                    await updateDoc(doc(db, 'users', uid!), {
                        name: tempName,
                    });
                    setUserProfile({
                        ...userProfile,
                        name: tempName,
                    });
                }
                if (tempBio !== userProfile.bio) {
                    await updateDoc(doc(db, 'users', uid!), {
                        bio: tempBio,
                    });
                    setUserProfile({
                        ...userProfile,
                        bio: tempBio,
                    });
                }
                if (tempBirthday !== userProfile.birthday) {
                    await updateDoc(doc(db, 'users', uid!), {
                        birthday: tempBirthday,
                    });
                    setUserProfile({
                        ...userProfile,
                        birthday: tempBirthday,
                    });
                }
                setHasUnsavedChanges(false);
                setIsLoading(false);

            } catch (err) {
                console.error('Error updating user profile:', err);
                setError('Failed to update user profile.');
                setIsLoading(false);
            }
        }
    };

    const handleNavigation = (e: BeforeUnloadEvent) => {
        if (hasUnsavedChanges) {
            e.preventDefault();
            e.returnValue = '';
        }
    };

    useEffect(() => {
        window.addEventListener('beforeunload', handleNavigation);
        return () => {
            window.removeEventListener('beforeunload', handleNavigation);
        };
    }, [hasUnsavedChanges]);

    const handleLeave = () => {
        setShowLeaveWarning(false);
    };

    const handleStay = () => {
        setShowLeaveWarning(false);
    };

    const handleBackNavigation = () => {
        if (hasUnsavedChanges) {
            setShowLeaveWarning(true);
        } else {
            window.history.back();
        }
    };

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

    const handleClickBack = () => {
        if (hasUnsavedChanges) {
            setShowLeaveWarning(true);
        } else {
            navigate('/profile');
        }

    }

    if (error) {
        return <div>{error}</div>;
    }

    if (isLoading) {
        return <div><SettingsSkeleton /></div>;
    }

    return (
        <div>
            <h1 className='w-fit mx-auto text-2xl mb-12 font-bold max-sm:text-xl bg-[#fefefe]'>Chỉnh sửa thông tin người dùng </h1>
            {userProfile && (
                <div className='container w-2/3 max-sm:w-5/6 mx-auto bg-white shadow-lg border bottom-2 max-sm:p-4 sm:p-10 rounded-2xl mb-10'>

                    <div className='flex justify-between font-bold text-xl my-12 '>
                        <p>Ảnh bìa</p>
                        <div className='flex gap-2 cursor-pointer' onClick={() => handleEditToggle('coverPhotoUrl')}>
                            <p>Chỉnh sửa</p>
                            <FaPencilAlt className="text-xl icon inline mt-2" />
                        </div>
                    </div>

                    {userProfile.coverPhotoUrl ? (
                        <div className='w-fit mx-auto'>

                            <img src={userProfile.coverPhotoUrl} alt="cover" style={{ minHeight: '200px', maxWidth: '100%' }} />
                        </div>
                    ) : (
                        <div className='w-full h-[300px] flex items-center justify-center text-gray-500 bg-gray-200'>
                            Chưa có ảnh bìa
                        </div>
                    )}

                    <div className='w-full flex flex-col my-12'>
                        <div className='flex justify-between font-bold text-xl'>
                            <p>Ảnh đại diện</p>
                            <div className='flex gap-2 cursor-pointer' onClick={() => handleEditToggle('avatar')}>
                                <p>Chỉnh sửa</p>
                                <FaPencilAlt className="text-xl icon inline mt-2" />
                            </div>
                        </div>
                        <div className='flex flex-col mt-12 h-48'>
                            <Avatar src={userProfile.avatar} alt="avatar" sx={{ width: 200, height: 200 }} className='mx-auto' />
                        </div>
                    </div>

                    <div className='flex flex-col gap-4 w-full'>
                        <div className='my-5 h-10 flex flex-col mb-10'>
                            <label className='font-bold text-xl mb-4'>Name:</label>
                            <TextField
                                value={tempName}
                                onChange={(e) => handleInputChange(e, 'name')}
                                rows={1}
                                fullWidth
                                error={!!validationErrors.tempName}
                                helperText={validationErrors.tempName}
                            />
                        </div>

                        <div className='mt-5 flex flex-col'>
                            <label className='font-bold text-xl mb-2'>Bio:</label>
                            <TextField
                                value={tempBio}
                                onChange={handleBioChange}
                                multiline
                                rows={3}
                                fullWidth
                                error={!!validationErrors.tempBio}
                                helperText={validationErrors.tempBio}
                            />
                        </div>

                        <div className='mb-5 flex flex-col'>
                            <label className='font-bold text-xl mb-2'>Birthday:</label>
                            <TextField
                                type="date"
                                value={tempBirthday || ''}
                                onChange={handleBirthdayChange}
                                fullWidth
                                error={!!validationErrors.tempBirthday}
                                helperText={validationErrors.tempBirthday}
                            />
                        </div>
                        <div className='flex justify-between'>
                            <Button className='flex gap-4 p-6 bg-gray-800 mr-auto rounded-lg items-center shadow-lg w-50' onClick={() => handleClickBack()}>
                                <FaArrowCircleLeft />
                                <p>Back
                                </p>
                            </Button>
                            {hasUnsavedChanges ? (
                                <div className='flex '>
                                    <Button variant="contained" color="primary" onClick={handleSave}>
                                        Save
                                    </Button>
                                </div>
                            ) : (
                                <div className='flex'>
                                    <Button variant="contained" color="primary" disabled>
                                        Save
                                    </Button>
                                </div>

                            )}
                        </div>
                    </div>
                </div>
            )}

            <Dialog
                open={showLeaveWarning}
                onClose={handleStay}
            >
                <DialogTitle>Warning</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Bạn đang chỉnh sửa thông tin, bạn muốn rời đi chứ?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleStay} color="primary">
                        Ở lại
                    </Button>
                    <Button onClick={handleLeave} color="primary">
                        Rời đi
                    </Button>
                </DialogActions>
            </Dialog>

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
                        Chỉnh sửa ảnh đại diện
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
                            Kéo và thả ảnh vào đây hoặc nhấn để chọn
                        </div>
                    </label>
                    {previewAvatar && (
                        <Avatar
                            src={previewAvatar}
                            alt="avatar preview"
                            sx={{ width: 200, height: 200, margin: '20px auto' }}
                        />
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
                        <Button onClick={() => handleEditToggle('avatar')} variant="contained" color="secondary">
                            Hủy
                        </Button>
                        <Button onClick={handleSave} variant="contained" color="primary">
                            Lưu
                        </Button>
                    </div>
                    {validationErrors.avatarFile && <p>{validationErrors.avatarFile as any}</p>}

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
                        Chỉnh sửa ảnh bìa
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
                            Kéo và thả ảnh vào đây hoặc nhấn để chọn
                        </div>
                    </label>
                    {previewCoverPhoto && (
                        <img src={previewCoverPhoto} alt="cover preview" style={{ width: '100%', marginTop: 20 }} />
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
                        <Button onClick={() => handleEditToggle('coverPhotoUrl')} variant="contained" color="secondary">
                            Hủy
                        </Button>
                        <Button onClick={handleSave} variant="contained" color="primary">
                            Lưu
                        </Button>
                    </div>
                    {validationErrors.coverPhotoFile && <p>{validationErrors.coverPhotoFile as any}</p>}
                </Box>
            </Modal>

        </div>
    );
};

export default SettingsUser;