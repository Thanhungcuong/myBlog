import React, { useState, useEffect, useRef, useCallback, } from 'react';
import { Avatar, Button, Modal, IconButton, TextField, InputAdornment } from '@mui/material';
import { FaArrowLeft, FaArrowRight, FaTimes, FaThumbsUp, FaComment, FaEllipsisH, FaRegPaperPlane, FaPlus, FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import { doc, updateDoc, arrayUnion, arrayRemove, onSnapshot, deleteDoc, Timestamp } from 'firebase/firestore';
import { db, realtimeDb } from '../../firebaseConfig';
import useQueryUserProfile from '../../hooks/query-user-profile/useQueryUserProfile';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ref as rlRef, push } from "firebase/database";
import { useNavigate } from 'react-router-dom';

interface Post {
    id: string;
    uid: string;
    author: string;
    content: string;
    imageUrls: string[];
    avatar: string;
    createdAt: Date | Timestamp;
    likes: string[];
    comments: Comment[];
}

interface Comment {
    uid: string;
    name: string;
    avatar: string;
    content: string;
    createdAt: Date | Timestamp;
}

const BASE_IMAGE_URL = "https://firebasestorage.googleapis.com/v0/b/my-blog-584c8.appspot.com/o/posts";

const PostCard: React.FC<{ post: Post }> = ({ post }) => {
    const [expandedImageIndex, setExpandedImageIndex] = useState<number | null>(null);
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const [likeCount, setLikeCount] = useState<number>(post.likes.length);
    const [isLiked, setIsLiked] = useState<boolean>(false);
    const [showComments, setShowComments] = useState<boolean>(false);
    const [newComment, setNewComment] = useState<string>('');
    const [comments, setComments] = useState<Comment[]>(post.comments);
    const [error, setError] = useState<string | null>(null);
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [imageEdited, setImageEdited] = useState<string[]>([]);
    const [imageUrlsEdited, setImageUrlsEdited] = useState<string[]>(post.imageUrls);
    const [showOptions, setShowOptions] = useState<boolean>(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [editedContent, setEditedContent] = useState<string>(post.content);
    const [newImages, setNewImages] = useState<File[]>([]);
    const optionsRef = useRef<HTMLDivElement>(null);
    const dropdownOption = useRef<HTMLDivElement>(null);

    const uid = localStorage.getItem('uid');
    const { userProfile, error: userProfileError } = useQueryUserProfile(uid || '');

    const [visibleComments, setVisibleComments] = useState<{ [key: number]: boolean }>({});

    const navigate = useNavigate();
    const handleToggleVisibility = (index: number) => {
        setVisibleComments((prevState) => ({
            ...prevState,
            [index]: !prevState[index]
        }));
    };

    const truncateText = (text: string, length: number) => {
        return text.length > length ? text.substring(0, length) + '...' : text;
    };


    useEffect(() => {
        if (userProfile && post.likes.includes(userProfile.uid)) {
            setIsLiked(true);
        }

        const fetchImageUrls = async () => {
            const urls = await Promise.all(
                post.imageUrls.map(async (dynamicUrlPart) => {
                    return await getFullImageUrl(dynamicUrlPart);
                })
            );
            setImageUrls(urls);
            setImageEdited(urls);

        };
        fetchImageUrls();

        const postRef = doc(db, 'posts', post.id);
        const unsubscribe = onSnapshot(postRef, (doc) => {
            if (doc.exists()) {
                const updatedPost = doc.data() as Post;
                setLikeCount(updatedPost.likes.length);
                setComments(updatedPost.comments.map(comment => ({
                    ...comment,
                    createdAt: comment.createdAt instanceof Timestamp ? comment.createdAt.toDate() : comment.createdAt
                })));
                if (userProfile) {
                    setIsLiked(updatedPost.likes.includes(userProfile.uid));
                }
            }
        });

        return () => unsubscribe();
    }, [userProfile, post.id, post.likes, post.imageUrls]);

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (
                dropdownOption.current &&
                !dropdownOption.current.contains(event.target as Node)
            ) {
                setShowOptions(false)

            }
        };

        if (showOptions) {
            document.addEventListener('mousedown', handleOutsideClick);
        } else {
            document.removeEventListener('mousedown', handleOutsideClick);
        }

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [showOptions]);

    const toggleLike = async () => {
        if (!userProfile) return;

        try {
            const postRef = doc(db, 'posts', post.id);
            const updatedLikes = isLiked
                ? arrayRemove(userProfile.uid)
                : arrayUnion(userProfile.uid);

            await updateDoc(postRef, {
                likes: updatedLikes,
            });

            if (!isLiked && userProfile.uid !== post.uid) {
                const notificationsRef = rlRef(realtimeDb, `notifications/${post.uid}`);
                await push(notificationsRef, {
                    user: userProfile.name,
                    type: 'like',
                    postId: post.id,
                    timestamp: new Date().toISOString(),
                });
            }
        } catch (err) {
            console.error('Error updating likes:', err);
            setError('Failed to update likes.');
        }
    };

    const handleCommentSubmit = async () => {
        if (!userProfile || !newComment) return;

        const comment = {
            uid: userProfile.uid,
            name: userProfile.name,
            avatar: userProfile.avatar,
            content: newComment,
            createdAt: new Date(),
        };

        try {
            const postRef = doc(db, 'posts', post.id);
            await updateDoc(postRef, {
                comments: arrayUnion(comment),
            });

            if (userProfile.uid !== post.uid) {
                const notificationsRef = rlRef(realtimeDb, `notifications/${post.uid}`);
                await push(notificationsRef, {
                    user: userProfile.name,
                    type: 'comment',
                    postId: post.id,
                    timestamp: new Date().toISOString(),
                });
            }

            setNewComment('');
        } catch (err) {
            console.error('Error adding comment:', err);
            setError('Failed to add comment.');
        }
    };

    const getFullImageUrl = async (dynamicUrlPart: string) => {
        try {
            const response = await fetch(`${BASE_IMAGE_URL}%2F${post.uid}%2F${dynamicUrlPart}`);
            const data = await response.json();
            return `${BASE_IMAGE_URL}%2F${post.uid}%2F${dynamicUrlPart}?alt=media&token=${data.downloadTokens}`;
        } catch (error) {
            console.error('Error fetching download token:', error);
            setError('Failed to fetch image URL.');
            return '';
        }
    };
    const toggleDropdown = useCallback((event: React.MouseEvent) => {
        event.stopPropagation();
        setShowOptions(!showOptions);
    }, [showOptions]);

    const handleEditPost = async () => {
        try {
            const postRef = doc(db, 'posts', post.id);

            let updatedImageFilenames = imageUrlsEdited.map((namefile) => {
                return namefile
            });

            if (newImages.length > 0) {
                const storage = getStorage();
                const uploadPromises = newImages.map((image) => {
                    const storageRef = ref(storage, `posts/${post.uid}/${image.name}`);
                    return uploadBytes(storageRef, image).then(() => {
                        return image.name;
                    });
                });

                const uploadedImageFilenames = await Promise.all(uploadPromises);
                updatedImageFilenames = [...updatedImageFilenames, ...uploadedImageFilenames];
            }

            await updateDoc(postRef, {
                content: editedContent,
                imageUrls: updatedImageFilenames,
            });

            setIsEditModalOpen(false);
        } catch (err) {
            console.error('Error updating post:', err);
            setError('Failed to update post.');
        }
    };



    const handleDeletePost = async () => {
        try {
            const postRef = doc(db, 'posts', post.id);
            await deleteDoc(postRef);
            setIsDeleteModalOpen(false);
        } catch (err) {
            console.error('Error deleting post:', err);
            setError('Failed to delete post.');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setNewImages((prevFiles) => [...prevFiles, ...filesArray]);

            const urlsArray = filesArray.map(file => URL.createObjectURL(file));
            setImageEdited((prevUrls) => [...prevUrls, ...urlsArray]);
        }
    };

    const handleRemoveImage = (index: number) => {
        setImageUrlsEdited((prevUrls) => prevUrls.filter((_, i) => i !== index));
        setImageEdited((prevUrls) => prevUrls.filter((_, i) => i !== index));
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (e.dataTransfer.files) {
            const filesArray = Array.from(e.dataTransfer.files);
            setNewImages((prevFiles) => [...prevFiles, ...filesArray]);

            const urlsArray = filesArray.map(file => URL.createObjectURL(file));

            setImageEdited((prevUrls) => [...prevUrls, ...urlsArray]);

        }
    };

    if (error) {
        return <div>{error}</div>;
    }

    const handleClickPost = (id: string) => {
        navigate(`/post/${id}`);
    }

    return (
        <div className=' p-8 bg-white rounded-md shadow-md shadow-black/10 relative max-w-[1000px] cursor-pointer'>
            <div className='flex items-center justify-between'>
                <div className='flex items-center'>
                    <Avatar src={post.avatar} alt="avatar" className='mr-4' />
                    <div>
                        <p className='text-lg font-bold'>{post.author}</p>
                        <p className='text-gray-500'>{new Date(post.createdAt instanceof Timestamp ? post.createdAt.toDate() : post.createdAt).toLocaleString()}</p>
                    </div>
                </div>
                {uid === post.uid && (
                    <div
                        onClick={toggleDropdown}
                        ref={dropdownOption}
                        className='cursor-pointer p-2 hover:bg-slate-300 rounded-full'
                    >
                        <FaEllipsisH />
                        {showOptions && (
                            <div ref={optionsRef} className='absolute top-20 right-4 z-50 bg-white shadow-lg rounded-lg p-2'>
                                <div>
                                    <Button onClick={(e) => { e.stopPropagation(); setIsEditModalOpen(true); }}>Chỉnh sửa bài viết</Button>
                                </div>
                                <div>
                                    <Button onClick={(e) => { e.stopPropagation(); setIsDeleteModalOpen(true); }}>Xóa bài viết</Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <p className='mt-4'>{post.content}</p>

            <div className='grid grid-cols-3 max-md:grid-cols-2 gap-2 mt-4'>
                {imageUrls.slice(0, 3).map((url, index) => (
                    <div key={index} className={`relative ${index === 0 ? 'max-md:col-span-2 w-full' : ''}`}>
                        <img
                            src={url}
                            alt="post_img"
                            className={`w-60 h-60 object-cover cursor-pointer ${index === 2 && imageUrls.length > 3 ? 'opacity-50' : ''}  ${index === 0 ? 'max-md:w-full' : ''}`}
                            onClick={() => { setExpandedImageIndex(index); setIsExpanded(true); }}
                            loading="lazy"
                        />
                        {index === 2 && imageUrls.length > 3 && (
                            <div className='absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 text-white text-xl cursor-pointer' onClick={() => { setExpandedImageIndex(index); setIsExpanded(true); }}>
                                {imageUrls.length - 3} more
                            </div>
                        )}
                    </div>
                ))}
            </div>


            <div className='flex justify-between items-center mt-4'>
                <div className='flex items-center'>
                    <IconButton onClick={toggleLike}>
                        <FaThumbsUp className={`${isLiked ? 'text-blue-700' : 'text-gray-500'}`} />
                    </IconButton>
                    <span>{likeCount}</span>
                </div>

                <div>
                    <IconButton onClick={() => setShowComments(!showComments)}>
                        <FaComment />
                    </IconButton>
                    <span className=''>{comments.length}</span>
                </div>

            </div>
            {showComments && (
                <div className="comments-section">
                    {comments.map((comment, index) => (
                        <div className="comment bg-slate-200 p-4 rounded-lg mb-4" key={index}>
                            <div className="avatar flex items-center gap-2 ">
                                <Avatar src={comment.avatar} />
                                <div>

                                    <div className="comment-author text-lg font-bold">{comment.name}</div>
                                    <p className='text-gray-500'>{post.createdAt instanceof Timestamp ? post.createdAt.toDate().toLocaleString() : new Date(post.createdAt).toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="comment-content">
                                <div className="comment-text text-wrap w-[600px] break-words">
                                    {truncateText(comment.content, visibleComments[index] ? comment.content.length : 80)}
                                    {comment.content.length > 80 && (
                                        <Button
                                            className="view-more-button"
                                            onClick={() => handleToggleVisibility(index)}
                                        >
                                            {visibleComments[index] ? 'View Less' : 'View More'}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="add-comment">
                        <TextField
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment"
                            variant="outlined"
                            fullWidth
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={handleCommentSubmit}>
                                            <FaRegPaperPlane />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </div>
                </div>
            )}
            <Modal
                open={isExpanded}
                onClose={() => setIsExpanded(false)}
                className='flex items-center justify-center'
            >
                <div className='relative w-2/3 h-3/4 flex items-center justify-center' tabIndex={0}>
                    <div className=' absolute cursor-pointer top-[5%] max-xl:top-1/3 right-[15%] text-xl text-slate-600 rounded-full p-2' onClick={() => setIsExpanded(false)}>

                        <FaTimes />
                    </div>
                    {expandedImageIndex !== null && (


                        <img src={imageUrls[expandedImageIndex]} alt="detail_img" className='w-2/3' />

                    )}
                    <div className='absolute top-1/2 xl:left-[5%] max-sm:left-0  max-xl:left-0 cursor-pointer text-3xl w-32  h-full flex justify-center items-center transform max-sm:-translate-x-1/2 -translate-y-1/2' onClick={() => setExpandedImageIndex((prev) => (prev === 0 ? post.imageUrls.length - 1 : (prev || 0) - 1))}>

                        <FaAngleLeft />

                    </div>
                    <div className='absolute top-1/2 xl:right-[5%] max-sm: max-xl:right-0 cursor-pointer text-3xl w-32  h-full flex justify-center items-center transform max-sm:translate-x-1/2 -translate-y-1/2' onClick={() => setExpandedImageIndex((prev) => ((prev || 0) + 1) % post.imageUrls.length)}>

                        <FaAngleRight />

                    </div>
                </div>
            </Modal>
            <Modal
                open={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                className='flex items-center justify-center'
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
            >
                <div className='bg-white p-4 rounded-md shadow-md w-1/3 '>
                    <div className='flex w-full justify-between '>

                        <h2 className='text-lg font-bold mb-4'>Chỉnh sửa bài viết</h2>
                        <FaTimes onClick={() => setIsEditModalOpen(false)} className='hover:bg-slate-300 cursor-pointer' />
                    </div>
                    <TextField
                        label="Nội dung"
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        fullWidth
                        variant="outlined"
                        multiline
                        rows={4}
                    />
                    <div className="grid grid-cols-3 gap-2 mt-2 border-2 border-dashed border-gray-300 p-4 cursor-pointer max-h-96 overflow-y-scroll">
                        {imageEdited.map((url, index) => (
                            <div key={index} className="relative">
                                <div>

                                    <div className='absolute top-1 right-1 p-1 rounded-full bg-slate-300 hover:bg-slate-600'>
                                        <FaTimes className='text-white' onClick={() => handleRemoveImage(index)} />
                                    </div>
                                    <img src={url} alt='edit' className='w-full h-full ' />

                                </div>
                            </div>
                        ))}
                        <input
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="file-input"
                            multiple
                            type="file"
                            onChange={handleFileChange}
                        />
                        <label htmlFor="file-input" className=' flex items-center justify-center border border-dashed border-gray-300 cursor-pointer'>
                            <FaPlus />
                        </label>
                    </div>
                    <div className='flex justify-end mt-4'>
                        <Button onClick={() => setIsEditModalOpen(false)} className='mr-2'>Hủy</Button>
                        <Button onClick={handleEditPost} color="primary">Lưu</Button>
                    </div>
                </div>
            </Modal>
            <Modal
                open={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                className='flex items-center justify-center'
            >
                <div className='bg-white p-4 rounded-md shadow-md'>
                    <h2 className='text-lg font-bold mb-4'>Xóa bài viết</h2>
                    <p>Bạn có chắc chắn muốn xóa bài viết này không?</p>
                    <div className='flex justify-end mt-4'>
                        <Button onClick={() => setIsDeleteModalOpen(false)} className='mr-2'>Hủy</Button>
                        <Button onClick={handleDeletePost} color="secondary">Xóa</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default PostCard;