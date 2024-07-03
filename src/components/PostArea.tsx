import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, storage } from '../firebaseConfig';
import { TextField, Button, Avatar, IconButton } from '@mui/material';
import { FaPaperPlane, FaImage, FaSmile, FaPlus, FaTimes } from 'react-icons/fa';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import useQueryUserProfile from '../hooks/query-user-profile/useQueryUserProfile';

interface UserProfile {
    email: string;
    uid: string;
    role: string;
    loginMethod: string;
    name: string;
    avatar: string;
}

const BASE_IMAGE_URL = "https://firebasestorage.googleapis.com/v0/b/my-blog-584c8.appspot.com/o/posts";

const PostArea: React.FC = () => {

    const [postContent, setPostContent] = useState<string>('');
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const [openAddImage, setOpenAddImage] = useState<boolean>(false);
    const [isDragImage, setIsDragImage] = useState<boolean>(true);

    const uid = localStorage.getItem('uid');
    const { userProfile, error: userProfileError } = useQueryUserProfile(uid || '');



    useEffect(() => {
        if (userProfileError) {
            setError(userProfileError);
        }
    }, [userProfileError]);

    const handlePostChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setPostContent(e.target.value);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setImageFiles((prevFiles) => [...prevFiles, ...filesArray]);

            const urlsArray = filesArray.map(file => URL.createObjectURL(file));
            setImageUrls((prevUrls) => [...prevUrls, ...urlsArray]);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (e.dataTransfer.files) {
            const filesArray = Array.from(e.dataTransfer.files);
            setImageFiles((prevFiles) => [...prevFiles, ...filesArray]);

            const urlsArray = filesArray.map(file => URL.createObjectURL(file));
            setImageUrls((prevUrls) => [...prevUrls, ...urlsArray]);

        }
    };

    const handleRemoveImage = (index: number) => {
        setImageFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
        setImageUrls((prevUrls) => prevUrls.filter((_, i) => i !== index));
    };

    const handlePostSubmit = async () => {
        if (userProfile && (postContent || imageFiles.length > 0)) {
            try {
                const uploadedImageUrls = await Promise.all(
                    imageFiles.map(async (file) => {
                        const storageRef = ref(storage, `posts/${uid}/${file.name}`);
                        await uploadBytes(storageRef, file);
                        const fullUrl = await getDownloadURL(storageRef);
                        return fullUrl.replace(BASE_IMAGE_URL, '');
                    })
                );

                const newPost = {
                    content: postContent,
                    imageUrls: uploadedImageUrls,
                    author: userProfile.name,
                    createdAt: new Date(),
                    updateAt: null,
                    uid: uid,
                    id: `${Date.now()}`,
                };

                await setDoc(doc(db, 'posts', `${uid}-${new Date().toISOString()}`), newPost);

                setPostContent('');
                setImageFiles([]);
                setImageUrls([]);
                setIsExpanded(false);
                setOpenAddImage(false);
            } catch (err) {
                console.error('Error posting content:', err);
                setError('Failed to post content.');
            }
        }
    };

    const getFullImageUrl = (dynamicUrlPart: string) => {
        return `${BASE_IMAGE_URL}${dynamicUrlPart}`;
    };

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className='max-w-[600px] mx-auto p-4 bg-white rounded-md shadow-md relative'>
            {userProfile && (
                <div>
                    {!isExpanded ? (
                        <div className='flex items-center cursor-pointer' onClick={() => setIsExpanded(true)}>
                            <Avatar src={userProfile.avatar} alt="avatar" className='mr-4' />
                            <TextField
                                placeholder="Bạn đang nghĩ gì? Hãy chia sẻ với tôi"
                                variant="outlined"
                                fullWidth
                                InputProps={{ readOnly: true }}
                                value={postContent}
                                className='cursor-pointer'
                            />
                        </div>
                    ) : (
                        <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50' onClick={() => { setIsExpanded(false); setOpenAddImage(false); }}>
                            <div className='bg-white p-6 rounded-lg shadow-lg w-full max-w-xl' onClick={(e) => e.stopPropagation()}>
                                <div className='flex flex-col w-full'>
                                    <div className='flex justify-end'>
                                        <IconButton onClick={() => { setIsExpanded(false); setOpenAddImage(false); }}>
                                            <FaTimes />
                                        </IconButton>
                                    </div>
                                    <div className='flex flex-col items-start'>
                                        <div className='flex gap-4 items-center mb-4'>
                                            <Avatar src={userProfile.avatar} alt="avatar" className='' />
                                            <p className='text-xl font-bold'>{userProfile.name}</p>
                                        </div>
                                        <TextField
                                            value={postContent}
                                            onChange={handlePostChange}
                                            placeholder="Bạn đang nghĩ gì? Hãy chia sẻ với tôi"
                                            multiline
                                            rows={3}
                                            variant="outlined"
                                            fullWidth
                                        />
                                    </div>

                                    {openAddImage && (
                                        <div
                                            className='border-2 border-dashed border-gray-300 p-4 text-center mt-4 cursor-pointer'
                                            onDrop={handleDrop}
                                            onDragOver={(e) => e.preventDefault()}
                                        >
                                            <input
                                                type="file"
                                                accept="image/*,video/*"
                                                id="image-upload"
                                                multiple
                                                style={{ display: 'none' }}
                                                onChange={handleFileChange}
                                            />
                                            {imageUrls.length === 0 && (
                                                <label htmlFor="image-upload" className=' h-40 flex flex-col justify-center items-center'>
                                                    <p className='mb-4'>Drag & drop your images or videos here</p>
                                                    <Button variant="contained" component="span">
                                                        Select Files
                                                    </Button>
                                                </label>
                                            )}
                                            {imageUrls.length > 0 && (
                                                <div className='grid grid-cols-3 gap-2 mt-2'>
                                                    {imageUrls.map((url, index) => (
                                                        <div key={index} className='relative'>
                                                            <IconButton
                                                                className='absolute top-0 right-0'
                                                                onClick={() => handleRemoveImage(index)}
                                                            >
                                                                <FaTimes />
                                                            </IconButton>
                                                            <img src={url} alt="Preview" className='w-full h-auto object-cover' />

                                                        </div>
                                                    ))}

                                                    <label htmlFor="image-upload" className=' flex items-center justify-center border border-dashed border-gray-300'>
                                                        <FaPlus />
                                                    </label>
                                                </div>
                                            )}
                                        </div>
                                    )}



                                    <div className='flex justify-between items-center mt-2'>
                                        <div>
                                            <IconButton component="span" onClick={() => setOpenAddImage(true)}>
                                                <FaImage />
                                            </IconButton>
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
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PostArea;
