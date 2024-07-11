import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../../firebaseConfig';
import { FaPencilAlt, FaTimes } from 'react-icons/fa';
import { TextField, Button, Avatar } from '@mui/material';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import SettingsSkeleton from '../../components/skeleton/SettingsSkeleton';

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

    const [isEditingBio, setIsEditingBio] = useState(false);
    const [isEditingBirthday, setIsEditingBirthday] = useState(false);
    const [tempName, setTempName] = useState<string>('');
    const [tempBio, setTempBio] = useState<string>('');
    const [tempBirthday, setTempBirthday] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [coverPhotoFile, setCoverPhotoFile] = useState<File | null>(null);
    const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
    const [previewCoverPhoto, setPreviewCoverPhoto] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

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
        if (field === 'name') {
            setTempName(e.target.value);
        }
    };

    const handleBioChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setTempBio(e.target.value);
    };

    const handleBirthdayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newBirthday = e.target.value || null;
        setTempBirthday(newBirthday);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'avatar' | 'coverPhotoUrl') => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (field === 'avatar') {
                setAvatarFile(file);
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviewAvatar(reader.result as string);
                };
                reader.readAsDataURL(file);
            } else if (field === 'coverPhotoUrl') {
                setCoverPhotoFile(file);
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviewCoverPhoto(reader.result as string);
                };
                reader.readAsDataURL(file);
            }
        }
    };

    const handleSave = async (field: keyof UserProfile) => {
        if (userProfile) {
            setIsLoading(true);
            try {
                if (field === 'avatar' && avatarFile) {
                    const storageRef = ref(storage, `avatars/${uid}/${avatarFile.name}`);
                    await uploadBytes(storageRef, avatarFile);

                    const downloadURL = await getDownloadURL(storageRef);

                    await updateDoc(doc(db, 'users', uid!), {
                        [field]: downloadURL,
                    });

                    setUserProfile({
                        ...userProfile,
                        [field]: downloadURL,
                    });
                    setAvatarFile(null);
                    setPreviewAvatar(null);
                    setIsLoading(false);
                } else if (field === 'coverPhotoUrl' && coverPhotoFile) {
                    const storageRef = ref(storage, `coverPhotos/${uid}/${coverPhotoFile.name}`);
                    await uploadBytes(storageRef, coverPhotoFile);

                    const downloadURL = await getDownloadURL(storageRef);

                    await updateDoc(doc(db, 'users', uid!), {
                        [field]: downloadURL,
                    });

                    setUserProfile({
                        ...userProfile,
                        [field]: downloadURL,
                    });
                    setCoverPhotoFile(null);
                    setPreviewCoverPhoto(null);
                    setIsLoading(false);
                } else if (field === 'name') {
                    await updateDoc(doc(db, 'users', uid!), {
                        [field]: tempName,
                    });

                    setUserProfile({
                        ...userProfile,
                        [field]: tempName,
                    });
                    setIsLoading(false);
                }

                handleEditToggle(field as keyof typeof isEditing);
            } catch (err) {
                console.error('Error updating user profile:', err);
                setError('Failed to update user profile.');
                setIsLoading(false);
            }
        }
    };

    const handleSaveBio = async () => {
        if (userProfile) {
            setIsLoading(true);
            try {
                await updateDoc(doc(db, 'users', uid!), {
                    bio: tempBio,
                });

                setUserProfile({
                    ...userProfile,
                    bio: tempBio,
                });
                setIsEditingBio(false);
                setIsLoading(false);
            } catch (err) {
                console.error('Error updating bio:', err);
                setError('Failed to update bio.');
            }
        }
    };

    const handleSaveBirthday = async () => {
        if (userProfile) {
            setIsLoading(true);
            try {
                await updateDoc(doc(db, 'users', uid!), {
                    birthday: tempBirthday,
                });

                setUserProfile({
                    ...userProfile,
                    birthday: tempBirthday,
                });
                setIsEditingBirthday(false);
                setIsLoading(false);

            } catch (err) {
                console.error('Error updating birthday:', err);
                setError('Failed to update birthday.');
            }
        }
    };

    if (error) {
        return <div>{error}</div>;
    }

    if (isLoading) {
        return <div><SettingsSkeleton /></div>
    }

    return (
        <div className=' '>
            <h1 className='w-fit mx-auto text-2xl mb-12 font-bold max-sm:text-xl'>Chỉnh sửa thông tin người dùng </h1>
            {userProfile && (
                <div className='container w-2/3 max-sm:w-5/6 mx-auto bg-slate-200 max-sm:p-4 sm:p-10 rounded-2xl mb-10'>
                    <div className='flex justify-between font-bold text-xl my-12 '>
                        <p>Ảnh bìa</p>
                        <div className='flex gap-2 cursor-pointer' onClick={() => handleEditToggle('coverPhotoUrl')}>
                            <p>Chỉnh sửa</p>
                            <FaPencilAlt className="text-xl icon inline mt-2" />
                        </div>
                    </div>

                    {isEditing.coverPhotoUrl ? (
                        <div className=' flex flex-col justify-center items-center h-32'>
                            <div className='h-[300px] flex items-center'>
                                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'coverPhotoUrl')} />
                                {previewCoverPhoto && (
                                    <img src={previewCoverPhoto} alt="cover preview" className='my-5' />

                                )}
                                <Button onClick={() => handleSave('coverPhotoUrl')}>Save</Button>
                            </div>

                            <div className='flex items-center justify-between cursor-pointer'>
                                <FaTimes className="text-xl icon inline" onClick={() => handleEditToggle('coverPhotoUrl')} />
                            </div>
                        </div>
                    ) : (
                        <div className='flex flex-col items-center '>
                            {userProfile.coverPhotoUrl ? (
                                <img src={userProfile.coverPhotoUrl} alt="cover" style={{ minHeight: '200px', maxWidth: '100%' }} />
                            ) : (
                                <div className='w-full h-[300px] flex items-center justify-center text-gray-500 bg-gray-200'>
                                    Chưa có ảnh bìa
                                </div>
                            )}

                        </div>
                    )}

                    <div className='w-full flex flex-col my-12'>
                        <div className='flex justify-between font-bold text-xl  '>
                            <p>Ảnh đại diện</p>
                            <div className='flex gap-2 cursor-pointer' onClick={() => handleEditToggle('avatar')}>
                                <p>Chỉnh sửa</p>
                                <FaPencilAlt className="text-xl icon inline mt-2" />
                            </div>
                        </div>
                        {isEditing.avatar ? (
                            <div className=' flex flex-col justify-center items-center h-48'>
                                <div className='h-[300px] flex items-center'>
                                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} />
                                    {previewAvatar && (
                                        <Avatar src={previewAvatar} alt="avatar preview" sx={{ width: 200, height: 200 }} className='my-5' />

                                    )}
                                    <Button onClick={() => handleSave('avatar')}>Save</Button>
                                </div>

                                <div className='flex items-center justify-between cursor-pointer'>
                                    <FaTimes className="text-xl icon inline" onClick={() => handleEditToggle('avatar')} />
                                </div>
                            </div>
                        ) : (
                            <div className='flex flex-col mt-12 h-48'>

                                <Avatar src={userProfile.avatar} alt="avatar" sx={{ width: 200, height: 200 }} className='mx-auto' />

                            </div>
                        )}
                    </div>


                    <div className='flex flex-col w-full'>

                        <div className='my-5 h-10 items-center'>
                            <label className='font-bold text-xl mb-2'>Name:</label>
                            {isEditing.name ? (
                                <div className='flex items-center'>
                                    <TextField
                                        value={tempName}
                                        onChange={(e) => handleInputChange(e, 'name')}
                                    />
                                    <Button onClick={() => handleSave('name')}>Save</Button>
                                    <FaTimes className="text-xl icon inline ml-2" onClick={() => handleEditToggle('name')} />
                                </div>
                            ) : (
                                <div className='flex items-center'>
                                    <span className='text-lg'>{userProfile.name}</span>
                                    <FaPencilAlt className="text-xl icon inline ml-5" onClick={() => handleEditToggle('name')} />
                                </div>
                            )}
                        </div>

                        <div className='my-5 flex flex-col'>
                            <label className='font-bold text-xl mb-2'>Bio:</label>
                            {isEditingBio ? (
                                <div className='flex items-center'>
                                    <TextField
                                        value={tempBio}
                                        onChange={handleBioChange}
                                        multiline
                                        rows={4}
                                        className='w-2/3'
                                    />
                                    <Button onClick={handleSaveBio} className='ml-2'>Save</Button>
                                    <FaTimes className="text-xl icon inline ml-2" onClick={() => setIsEditingBio(false)} />
                                </div>
                            ) : (
                                <div className='flex items-center'>
                                    <span className='text-lg'>{userProfile?.bio ? userProfile.bio : 'Chưa có'}</span>
                                    <FaPencilAlt className="text-xl icon inline ml-5" onClick={() => setIsEditingBio(true)} />
                                </div>
                            )}
                        </div>

                        <div className='my-5 flex flex-col'>
                            <label className='font-bold text-xl mb-2'>Birthday:</label>
                            {isEditingBirthday ? (
                                <div className='flex items-center'>
                                    <input
                                        type="date"
                                        value={tempBirthday || ''}
                                        onChange={handleBirthdayChange}
                                    />
                                    <Button onClick={handleSaveBirthday} className='ml-2'>Save</Button>
                                    <FaTimes className="text-xl icon inline ml-2" onClick={() => setIsEditingBirthday(false)} />
                                </div>
                            ) : (
                                <div className='flex items-center'>
                                    <span className='text-lg'>{userProfile?.birthday ? new Date(userProfile.birthday).toLocaleDateString() : 'No birthday set'}</span>
                                    <FaPencilAlt className="text-xl icon inline ml-5" onClick={() => setIsEditingBirthday(true)} />
                                </div>
                            )}
                        </div>


                    </div>


                </div>
            )}
        </div>
    );
};

export default SettingsUser;
