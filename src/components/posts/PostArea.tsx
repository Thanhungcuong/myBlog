import React, { useState, useEffect } from 'react';
import { TextField, Button, Avatar, IconButton } from '@mui/material';
import { FaPaperPlane, FaImage, FaSmile, FaPlus, FaTimes } from 'react-icons/fa';
import useQueryUserProfile from '../../hooks/query-user-profile/useQueryUserProfile';
import { useAppDispatch } from '../../redux/store';
import { createPost } from '../../redux/slices/postArea/uploadSlice';
import { PostSchema } from '../../constant/schema';
import * as z from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useSnackbar } from 'notistack';
import { RootState } from '../../redux/store';
import { useSelector } from 'react-redux';


interface UserProfile {
    email: string;
    uid: string;
    role: string;
    loginMethod: string;
    name: string;
    avatar: string;
}

const PostArea: React.FC = () => {
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const [openAddImage, setOpenAddImage] = useState<boolean>(false);

    const uid = useSelector((state: RootState) => state.uid.uid);
    const { userProfile, error: userProfileError } = useQueryUserProfile(uid || '');
    const dispatch = useAppDispatch();
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const { enqueueSnackbar } = useSnackbar();


    const { control, handleSubmit, setError, clearErrors, formState: { errors }, reset } = useForm({
        resolver: zodResolver(PostSchema),
        defaultValues: {
            postContent: '',
            imageFiles: [],
        }
    });



    const onSubmit = async (data: { postContent: string, imageFiles: File[] }) => {
        try {
            if (userProfile && (data.postContent || imageFiles.length > 0)) {
                if (!uid) {
                    enqueueSnackbar('UID không hợp lệ!', { variant: 'error' });
                    return;
                }
                await dispatch(createPost({ postContent: data.postContent, imageFiles, userProfile, uid }));
                reset();
                setImageFiles([]);
                setImageUrls([]);
                setIsExpanded(false);
                setOpenAddImage(false);
                enqueueSnackbar('Bài post được tạo thành công!', {
                    variant: 'success',
                    anchorOrigin: { vertical: 'top', horizontal: 'right' },
                    autoHideDuration: 2000
                });
            }
        } catch (error) {
            console.error("Error creating post:", error);
            enqueueSnackbar('Tạo bài viết thất bại. Hãy thử lại! ', {
                variant: 'error',
                anchorOrigin: { vertical: 'top', horizontal: 'right' },
                autoHideDuration: 2000
            });
        }
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

    return (
        <div className='w-2/3 mx-auto p-4 bg-white rounded-md shadow-md border-t-2 relative'>
            {userProfile && (
                <form onSubmit={handleSubmit(onSubmit)}>
                    {!isExpanded ? (
                        <div className='flex items-center cursor-pointer' onClick={() => setIsExpanded(true)}>
                            <Avatar src={userProfile.avatar} alt="avatar" className='mr-4' sx={{ width: isSmallScreen ? 24 : 32, height: isSmallScreen ? 24 : 32 }} />
                            <TextField
                                placeholder="Bạn đang nghĩ gì? Hãy chia sẻ với tôi"
                                variant="outlined"
                                fullWidth
                                InputProps={{ readOnly: true }}
                                className='cursor-pointer placeholder:text-wrap'
                            />
                        </div>
                    ) : (
                        <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50' onClick={() => { setIsExpanded(false); setOpenAddImage(false); }}>
                            <div className='bg-white p-6 rounded-lg shadow-lg w-full max-w-xl' onClick={(e) => e.stopPropagation()}>
                                <div className='flex flex-col w-full'>
                                    <div className='flex justify-between items-center mb-4'>
                                        <div className='flex gap-4 items-center'>
                                            <Avatar src={userProfile.avatar} alt="avatar" className='mr-4' sx={{ width: isSmallScreen ? 24 : 32, height: isSmallScreen ? 24 : 32 }} />
                                            <p className='text-xl font-bold'>{userProfile.name}</p>
                                        </div>
                                        <IconButton onClick={() => { setIsExpanded(false); setOpenAddImage(false); }}>
                                            <FaTimes />
                                        </IconButton>
                                    </div>
                                    <div className='flex flex-col items-start'>
                                        <Controller
                                            name="postContent"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    placeholder="Bạn đang nghĩ gì? Hãy chia sẻ với tôi"
                                                    multiline
                                                    rows={3}
                                                    variant="outlined"
                                                    fullWidth
                                                    error={!!errors.postContent}
                                                    helperText={errors.postContent?.message}
                                                />
                                            )}
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
                                                            <img src={url} alt="Preview" className='w-full h-[150px] object-cover' />
                                                        </div>
                                                    ))}
                                                    <label htmlFor="image-upload" className=' flex items-center justify-center border border-dashed border-gray-300'>
                                                        <FaPlus />
                                                    </label>
                                                </div>
                                            )}
                                            {errors.imageFiles && <p className="text-red-500 mt-2">{errors.imageFiles.message}</p>}
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
                                            type="submit"
                                        >
                                            Post
                                        </Button>
                                    </div>

                                </div>
                            </div>
                        </div>
                    )}
                </form>
            )}
        </div>
    );
};

export default PostArea;
