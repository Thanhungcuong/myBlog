import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, storage } from '../firebaseConfig';
import { TextField, Button, Avatar, IconButton } from '@mui/material';
import { FaPaperPlane, FaImage, FaSmile } from 'react-icons/fa';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface UserProfile {
    email: string;
    uid: string;
    role: string;
    loginMethod: string;
    name: string;
    avatar: string;
}

const PostArea: React.FC = () => {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [postContent, setPostContent] = useState<string>('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

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

    const handlePostChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setPostContent(e.target.value);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePostSubmit = async () => {
        if (userProfile && (postContent || imageFile)) {
            try {
                let uploadedImageUrl = null;

                if (imageFile) {
                    const storageRef = ref(storage, `posts/${uid}/${imageFile.name}`);
                    await uploadBytes(storageRef, imageFile);
                    uploadedImageUrl = await getDownloadURL(storageRef);
                }

                const newPost = {
                    content: postContent,
                    imageUrl: uploadedImageUrl,
                    author: userProfile.name,
                    avatar: userProfile.avatar,
                    createdAt: new Date(),
                };

                await setDoc(doc(db, 'posts', `${uid}-${new Date().toISOString()}`), newPost);

                setPostContent('');
                setImageFile(null);
                setImageUrl(null);
            } catch (err) {
                console.error('Error posting content:', err);
                setError('Failed to post content.');
            }
        }
    };

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className='post-area max-w-[600px] mx-auto p-4 bg-white rounded-md shadow-md'>
            {userProfile && (
                <div className='flex items-start'>
                    <Avatar src={userProfile.avatar} alt="avatar" className='mr-4' />
                    <div className='flex flex-col w-full'>
                        <TextField
                            value={postContent}
                            onChange={handlePostChange}
                            placeholder="Bạn đang nghĩ gì? Hãy chia sẻ với tôi"
                            multiline
                            rows={3}
                            variant="outlined"
                            fullWidth
                        />
                        {imageUrl && (
                            <div className='mt-2'>
                                <img src={imageUrl} alt="Preview" className='w-full max-h-[300px] object-cover' />
                            </div>
                        )}
                        <div className='flex justify-between items-center mt-2'>
                            <div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    id="image-upload"
                                    style={{ display: 'none' }}
                                    onChange={handleFileChange}
                                />
                                <label htmlFor="image-upload">
                                    <IconButton component="span">
                                        <FaImage />
                                    </IconButton>
                                </label>
                                <IconButton>
                                    <FaSmile />
                                </IconButton>
                            </div>
                            <Button
                                variant="contained"
                                color="primary"
                                endIcon={<FaPaperPlane />}
                                onClick={handlePostSubmit}
                            >
                                Post
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostArea;
