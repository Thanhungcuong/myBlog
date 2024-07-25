import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useForm, Controller } from 'react-hook-form';
import { db, storage } from '../../firebaseConfig';
import { FaPencilAlt, FaArrowCircleLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Avatar, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Modal, Box, Typography } from '@mui/material';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import SettingsSkeleton from '../../components/skeleton/SettingsSkeleton';
import { EditProfileSchema } from '../../constant/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { defaultValues } from '../../constant/defaultValue/defaultValue';
import { RootState } from '../../redux/store';
import { useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';


enum EditField {
    Avatar = 'avatar',
    CoverPhotoUrl = 'coverPhotoUrl',
    Name = 'name',
    Bio = 'bio',
    Birthday = 'birthday'
}

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
        [EditField.Name]: true,
        [EditField.Avatar]: false,
        [EditField.CoverPhotoUrl]: false,
        [EditField.Bio]: true,
        [EditField.Birthday]: true,
    });
    const [error, setError] = useState<string | null>(null);
    const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
    const [previewCoverPhoto, setPreviewCoverPhoto] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
    const [showLeaveWarning, setShowLeaveWarning] = useState<boolean>(false);
    const navigate = useNavigate();
    const uid = useSelector((state: RootState) => state.uid.uid);
    const { enqueueSnackbar } = useSnackbar();

    const { register, handleSubmit, setValue, control, formState: { errors, dirtyFields } } = useForm({
        resolver: zodResolver(EditProfileSchema),
        defaultValues: defaultValues
    });

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
                    setValue('tempName', data.name);
                    setValue('tempBio', data.bio || '');
                    setValue('tempBirthday', data.birthday || null);
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
        if (field === EditField.Avatar) {
            setPreviewAvatar(null);
            setValue('avatarFile', null);
        }
        if (field === EditField.CoverPhotoUrl) {
            setPreviewCoverPhoto(null);
            setValue('coverPhotoFile', null);
        }
    };

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>,
        field: EditField.Avatar | EditField.CoverPhotoUrl
    ) => {
        setHasUnsavedChanges(true);


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
                if (field === EditField.Avatar) {
                    setValue('avatarFile', file);
                    setPreviewAvatar(reader.result as string);
                } else if (field === EditField.CoverPhotoUrl) {
                    setValue('coverPhotoFile', file);
                    setPreviewCoverPhoto(reader.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async (data: any) => {
        if (userProfile) {
            setIsLoading(true);
            try {
                const updates: Partial<UserProfile> = {};
                if (data.avatarFile) {
                    const storageRef = ref(storage, `avatars/${uid}/${data.avatarFile.name}`);
                    await uploadBytes(storageRef, data.avatarFile);
                    const downloadURL = await getDownloadURL(storageRef);
                    updates.avatar = downloadURL;
                }
                if (data.coverPhotoFile) {
                    const storageRef = ref(storage, `coverPhotos/${uid}/${data.coverPhotoFile.name}`);
                    await uploadBytes(storageRef, data.coverPhotoFile);
                    const downloadURL = await getDownloadURL(storageRef);
                    updates.coverPhotoUrl = downloadURL;
                }
                if (data.tempName !== userProfile.name) {
                    updates.name = data.tempName;
                }
                if (data.tempBio !== userProfile.bio) {
                    updates.bio = data.tempBio;
                }
                if (data.tempBirthday !== userProfile.birthday) {
                    updates.birthday = data.tempBirthday;
                }
                if (Object.keys(updates).length > 0) {
                    await updateDoc(doc(db, 'users', uid!), updates);
                    setUserProfile({ ...userProfile, ...updates });
                }
                setHasUnsavedChanges(false);
                setIsLoading(false);
                setIsEditing(prevState => ({
                    ...prevState,
                    avatar: false,
                    coverPhotoUrl: false
                }));
                enqueueSnackbar('Bạn đã chỉnh sửa thông tin cá nhân thành công!', {
                    variant: 'success',
                    anchorOrigin: { vertical: 'top', horizontal: 'right' },
                    autoHideDuration: 2000
                });
            } catch (err) {
                console.error('Error updating user profile:', err);
                setIsLoading(false);
                enqueueSnackbar('Chỉnh sửa thông tin cá nhân thất bại. Hãy thử lại!', {
                    variant: 'success',
                    anchorOrigin: { vertical: 'top', horizontal: 'right' },
                    autoHideDuration: 2000
                });
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
    };

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
                <div className='container mx-auto bottom-2 max-sm:p-4 sm:p-10 mb-10 flex flex-col divide-y-2'>
                    <div>

                        <div className='flex justify-between font-bold text-xl my-12 '>
                            <p>Ảnh bìa</p>
                            <div className='flex gap-2 cursor-pointer' onClick={() => handleEditToggle(EditField.CoverPhotoUrl)}>
                                <p>Chỉnh sửa</p>
                                <FaPencilAlt className="text-xl icon inline mt-2" />
                            </div>
                        </div>

                        {userProfile.coverPhotoUrl ? (
                            <div className='flex justify-center items-center'>
                                <img src={userProfile.coverPhotoUrl} alt="cover" className=' w-fit mx-auto h-96' />
                            </div>
                        ) : (
                            <div className='w-full h-[300px] flex items-center justify-center text-gray-500 bg-gray-200'>
                                Chưa có ảnh bìa
                            </div>
                        )}
                    </div>

                    <div className='w-full flex flex-col my-12 pt-5'>
                        <div className='flex justify-between font-bold text-xl'>
                            <p>Ảnh đại diện</p>
                            <div className='flex gap-2 cursor-pointer' onClick={() => handleEditToggle(EditField.Avatar)}>
                                <p>Chỉnh sửa</p>
                                <FaPencilAlt className="text-xl icon inline mt-2" />
                            </div>
                        </div>

                        <div className='flex justify-center my-8'>
                            <Avatar alt="avatar" src={userProfile.avatar} sx={{ width: 200, height: 200 }} />
                        </div>
                    </div>

                    <div className='w-full flex flex-col my-12 pt-5'>
                        <div className='flex justify-between font-bold text-xl mb-4'>
                            <p>Tên</p>

                        </div>

                        <Controller
                            name="tempName"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    disabled={!isEditing.name}
                                    fullWidth
                                    variant="outlined"
                                    placeholder={userProfile.name}
                                    error={!!errors.tempName}
                                    helperText={errors.tempName?.message}
                                />
                            )}
                        />
                    </div>

                    <div className='w-full flex flex-col my-12 pt-5'>
                        <div className='flex justify-between font-bold text-xl mb-4'>
                            <p>Tiểu sử</p>

                        </div>

                        <Controller
                            name="tempBio"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    disabled={!isEditing.bio}
                                    fullWidth
                                    variant="outlined"
                                    placeholder={userProfile.bio || "Chưa có tiểu sử"}
                                    error={!!errors.tempBio}
                                    helperText={errors.tempBio?.message}
                                />
                            )}
                        />
                    </div>

                    <div className='w-full flex flex-col my-12 pt-5'>
                        <div className='flex justify-between font-bold text-xl mb-4'>
                            <p>Ngày sinh</p>

                        </div>

                        <Controller
                            name="tempBirthday"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    type="date"
                                    disabled={!isEditing.birthday}
                                    fullWidth
                                    variant="outlined"
                                    InputLabelProps={{ shrink: true }}
                                    error={!!errors.tempBirthday}
                                    helperText={errors.tempBirthday?.message}
                                />
                            )}
                        />
                    </div>

                    <div className='flex justify-between mt-10 pt-5'>
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={handleClickBack}
                            startIcon={<FaArrowCircleLeft />}
                        >
                            Quay lại
                        </Button>

                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSubmit(handleSave)}
                            disabled={!Object.keys(dirtyFields).length && !hasUnsavedChanges}
                        >
                            Lưu thay đổi
                        </Button>
                    </div>
                </div>
            )}

            <Modal
                open={showLeaveWarning}
                onClose={handleStay}
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
                    <DialogActions>
                        <Button onClick={handleLeave}>Rời đi</Button>
                        <Button onClick={handleStay} autoFocus>
                            Ở lại
                        </Button>
                    </DialogActions>
                </Box>
            </Modal>

            <Modal
                open={isEditing.avatar}
                onClose={() => handleEditToggle(EditField.Avatar)}
                aria-labelledby="modal-avatar-title"
                aria-describedby="modal-avatar-description"
            >
                <Box
                    sx={modalStyle}
                    onDrop={(e) => {
                        e.preventDefault();
                        handleFileChange(e as React.DragEvent<HTMLDivElement>, EditField.Avatar);
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
                                onChange={(e) => handleFileChange(e, EditField.Avatar)}
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
                        <Button onClick={() => handleEditToggle(EditField.Avatar)} variant="contained" color="secondary">
                            Hủy
                        </Button>
                        <Button onClick={handleSubmit(handleSave)} variant="contained" color="primary">
                            Lưu
                        </Button>
                    </div>
                    {errors.avatarFile && <p>{errors.avatarFile as any}</p>}

                </Box>
            </Modal>
            <Modal
                open={isEditing.coverPhotoUrl}
                onClose={() => handleEditToggle(EditField.CoverPhotoUrl)}
                aria-labelledby="modal-cover-title"
                aria-describedby="modal-cover-description"
            >
                <Box
                    sx={modalStyle}
                    onDrop={(e) => {
                        e.preventDefault();
                        handleFileChange(e as React.DragEvent<HTMLDivElement>, EditField.CoverPhotoUrl);
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
                                onChange={(e) => handleFileChange(e, EditField.CoverPhotoUrl)}
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
                        <Button onClick={() => handleEditToggle(EditField.CoverPhotoUrl)} variant="contained" color="secondary">
                            Hủy
                        </Button>
                        <Button onClick={handleSubmit(handleSave)} variant="contained" color="primary">
                            Lưu
                        </Button>
                    </div>
                    {errors.coverPhotoFile && <p>{errors.coverPhotoFile as any}</p>}
                </Box>
            </Modal>
        </div>
    );
};

export default SettingsUser;
