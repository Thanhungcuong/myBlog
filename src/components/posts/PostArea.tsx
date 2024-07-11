import React, { useState, useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db, storage } from '../../firebaseConfig';
import { TextField, Button, Avatar, IconButton } from '@mui/material';
import { FaPaperPlane, FaImage, FaSmile, FaPlus, FaTimes } from 'react-icons/fa';
import { ref, uploadBytes } from 'firebase/storage';
import useQueryUserProfile from '../../hooks/query-user-profile/useQueryUserProfile';
import { v4 as uuidv4 } from 'uuid';

interface UserProfile {
    email: string;
    uid: string;
    role: string;
    loginMethod: string;
    name: string;
    avatar: string;
}

const PostArea: React.FC = () => {
    const [postContent, setPostContent] = useState<string>('');
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const [openAddImage, setOpenAddImage] = useState<boolean>(false);

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
                const uploadedImageFilenames = await Promise.all(
                    imageFiles.map(async (file) => {
                        const storageRef = ref(storage, `posts/${uid}/${file.name}`);
                        await uploadBytes(storageRef, file);
                        return file.name;
                    })
                );

                const newPost = {
                    content: postContent,
                    imageUrls: uploadedImageFilenames,
                    author: userProfile.name,
                    createdAt: new Date(),
                    updateAt: null,
                    uid: uid,
                    id: uuidv4(),
                    likes: [],
                    comments: [],
                    avatar: userProfile.avatar
                };

                await setDoc(doc(db, 'posts', newPost.id), newPost);

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
                                className='cursor-pointer placeholder:text-wrap'
                            />
                        </div>
                    ) : (
                        <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50' onClick={() => { setIsExpanded(false); setOpenAddImage(false); }}>
                            <div className='bg-white p-6 rounded-lg shadow-lg w-full max-w-xl' onClick={(e) => e.stopPropagation()}>
                                <div className='flex flex-col w-full'>
                                    <div className='flex justify-between items-center mb-4'>
                                        <div className='flex gap-4 items-center'>
                                            <Avatar src={userProfile.avatar} alt="avatar" className='' />
                                            <p className='text-xl font-bold'>{userProfile.name}</p>
                                        </div>
                                        <IconButton onClick={() => { setIsExpanded(false); setOpenAddImage(false); }}>
                                            <FaTimes />
                                        </IconButton>
                                    </div>
                                    <div className='flex flex-col items-start'>

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
                                            className='border-2 border-dashed border-gray-300 p-4 text-center mt-4 cursor-pointer max-h-96 overflow-y-scroll'
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
                                                            <div className='absolute top-1 right-1 p-1 rounded-full bg-slate-300 hover:bg-slate-600'>
                                                                <FaTimes className='text-white' onClick={() => handleRemoveImage(index)} />
                                                            </div>

                                                            <img src={url} alt="Preview" className='w-full h-full object-cover' />

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
                                            <IconButton component="span" onClick={() => setOpenAddImage(!openAddImage)}>
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
