import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../../firebaseConfig';
import { FaPencilAlt, FaTimes } from 'react-icons/fa';
import { TextField, Button, Avatar } from '@mui/material';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface UserProfile {
    email: string;
    uid: string;
    role: string;
    loginMethod: string;
    name: string;
    avatar: string;
}

const SettingsUser: React.FC = () => {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isEditing, setIsEditing] = useState({
        name: false,
        avatar: false,
    });

    const [tempName, setTempName] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);

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
                    setUserProfile(userDoc.data() as UserProfile);
                } else {
                    setError('User does not exist.');
                }
            } catch (err) {
                console.error('Error fetching user profile:', err);
                setError('Failed to fetch user profile.');
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
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: keyof UserProfile) => {
        if (field === 'name') {
            setTempName(e.target.value);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewAvatar(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async (field: keyof UserProfile) => {
        if (userProfile) {
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
                } else if (field === 'name') {
                    await updateDoc(doc(db, 'users', uid!), {
                        [field]: tempName,
                    });

                    setUserProfile({
                        ...userProfile,
                        [field]: tempName,
                    });
                }

                handleEditToggle(field as keyof typeof isEditing);
            } catch (err) {
                console.error('Error updating user profile:', err);
                setError('Failed to update user profile.');
            }
        }
    };

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className='max-w-[1440px] mx-auto'>
            {userProfile && (
                <div>
                    <h1 className='w-fit mx-auto text-2xl mb-12'>Thông tin người dùng <span className='font-bold'>{userProfile.name}</span></h1>
                    <div className='flex justify-center items-center'>
                        <div className='w-1/2 flex flex-col justify-center items-center gap-10'>
                            {isEditing.avatar ? (
                                <div className=' flex flex-col justify-center items-center'>
                                    <div className='h-[300px] flex items-center'>
                                        <input type="file" accept="image/*" onChange={handleFileChange} />
                                        {previewAvatar && (
                                            <Avatar src={previewAvatar} alt="avatar preview" sx={{ width: 200, height: 200 }} className='my-5' />

                                        )}
                                        <Button onClick={() => handleSave('avatar')}>Save</Button>
                                    </div>

                                    <div className='flex items-center justify-between'>

                                        <FaTimes className="text-xl icon inline" onClick={() => handleEditToggle('avatar')} />
                                    </div>
                                </div>
                            ) : (
                                <div className='flex flex-col items-center'>
                                    <Avatar src={userProfile.avatar} alt="avatar" sx={{ width: 300, height: 300 }} className='mx-auto' />
                                    <FaPencilAlt className="text-xl icon inline mt-2" onClick={() => handleEditToggle('avatar')} />
                                </div>
                            )}
                        </div>
                        <div className='flex flex-col w-1/2'>
                            <div>
                                <label className='font-bold text-xl '>Email: </label>
                                <span className='text-lg'>{userProfile.email}</span>
                            </div>
                            <div className='my-5 flex'>
                                <label className='font-bold text-xl mr-1'>Name: </label>
                                {isEditing.name ? (
                                    <div className='flex items-center'>
                                        <TextField
                                            value={tempName}
                                            onChange={(e) => handleInputChange(e, 'name')}
                                        />
                                        <Button onClick={() => handleSave('name')} className='ml-2'>Save</Button>
                                        <FaTimes className="text-xl icon inline ml-2" onClick={() => handleEditToggle('name')} />
                                    </div>
                                ) : (
                                    <div className='flex items-center'>
                                        <span className='text-lg'>{userProfile.name}</span>
                                        <FaPencilAlt className="text-xl icon inline ml-5" onClick={() => handleEditToggle('name')} />
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className='font-bold text-xl '>Login Method: </label>
                                <span className='text-lg'>{userProfile.loginMethod}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsUser;
