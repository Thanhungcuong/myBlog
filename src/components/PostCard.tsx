import React, { useState, useEffect, useRef } from 'react';
import { Avatar, Button, Modal, IconButton, TextField } from '@mui/material';
import { FaArrowLeft, FaArrowRight, FaTimes, FaThumbsUp, FaComment, FaEllipsisH, FaRegPaperPlane } from 'react-icons/fa';
import { doc, updateDoc, arrayUnion, arrayRemove, onSnapshot, deleteDoc, Timestamp } from 'firebase/firestore';
import { db, realtimeDb } from '../firebaseConfig';
import useQueryUserProfile from '../hooks/query-user-profile/useQueryUserProfile';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ref as rlRef, push } from "firebase/database";

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
    const [showOptions, setShowOptions] = useState<boolean>(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [editedContent, setEditedContent] = useState<string>(post.content);
    const [newImages, setNewImages] = useState<File[]>([]);
    const optionsRef = useRef<HTMLDivElement>(null);

    const uid = localStorage.getItem('uid');
    const { userProfile, error: userProfileError } = useQueryUserProfile(uid || '');

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
        const handleClickOutside = (event: MouseEvent) => {
            if (optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
                setShowOptions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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
    const toggleDropdown = () => {
        setShowOptions(!showOptions);
    };

    const handleEditPost = async () => {
        try {
            const postRef = doc(db, 'posts', post.id);
            let updatedImageUrls = post.imageUrls;

            if (newImages.length > 0) {
                const storage = getStorage();
                const uploadPromises = newImages.map((image) => {
                    const storageRef = ref(storage, `posts/${post.uid}/${image.name}`);
                    return uploadBytes(storageRef, image).then(async (snapshot) => {
                        const downloadURL = await getDownloadURL(snapshot.ref);
                        return downloadURL;
                    });
                });

                const uploadedImageUrls = await Promise.all(uploadPromises);
                updatedImageUrls = [...updatedImageUrls, ...uploadedImageUrls];
            }

            await updateDoc(postRef, {
                content: editedContent,
                imageUrls: updatedImageUrls,
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

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className=' p-8 bg-white rounded-md shadow-lg shadow-black/50 border-t-2 relative'>
            <div className='flex items-center justify-between'>
                <div className='flex items-center'>
                    <Avatar src={post.avatar} alt="avatar" className='mr-4' />
                    <div>
                        <p className='text-lg font-bold'>{post.author}</p>
                        <p className='text-gray-500'>{new Date(post.createdAt instanceof Timestamp ? post.createdAt.toDate() : post.createdAt).toLocaleString()}</p>
                    </div>
                </div>
                <div
                    onClick={toggleDropdown}
                    ref={optionsRef}
                    className='cursor-pointer p-2 hover:bg-slate-300 rounded-full'
                >
                    <FaEllipsisH />
                </div>
            </div>
            {showOptions && (
                <div className='absolute top-15 right-4 z-50 bg-white shadow-lg rounded-lg p-2'>
                    <div>
                        <Button onClick={() => setIsEditModalOpen(true)}>Chỉnh sửa bài viết</Button>
                    </div>
                    <div>
                        <Button onClick={() => setIsDeleteModalOpen(true)}>Xóa bài viết</Button>
                    </div>
                </div>
            )}
            <p className='mt-4'>{post.content}</p>

            <div className='grid grid-cols-3 gap-2 mt-4'>
                {imageUrls.slice(0, 3).map((url, index) => (
                    <div key={index} className='relative'>
                        <img
                            src={url}
                            alt="post_img"
                            className={`w-60 h-60 object-cover cursor-pointer ${index === 2 && imageUrls.length > 3 ? 'opacity-50' : ''}`}
                            onClick={() => { setExpandedImageIndex(index); setIsExpanded(true); }}
                            loading="lazy"
                        />
                        {index === 2 && imageUrls.length > 3 && (
                            <div className='absolute cursor-pointer inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 text-white text-xl' onClick={() => { setExpandedImageIndex(index); setIsExpanded(true); }}>
                                {imageUrls.length - 3} more
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className='flex justify-between items-center mt-4'>
                <div className='flex items-center'>
                    <IconButton onClick={toggleLike}>
                        <FaThumbsUp className={`${isLiked ? 'text-blue-500' : 'text-gray-500'}`} />
                    </IconButton>
                    <span>{likeCount}</span>
                </div>
                <Button onClick={() => setShowComments(!showComments)}>
                    <FaComment className='mr-2' /> {comments.length}
                </Button>
            </div>
            {showComments && (
                <div className='mt-4'>
                    <div className='flex gap-4 items-center'>

                        <TextField
                            label="Add a comment"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            fullWidth
                            variant="outlined"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleCommentSubmit();
                                }
                            }}
                        />
                        <div onClick={handleCommentSubmit} className='p-4 text-xl rounded-full bg-slate-100 hover:bg-slate-300'><FaRegPaperPlane /></div>
                    </div>

                    {comments.map((comment, index) => (
                        <div key={index} className='flex items-start mt-4'>
                            <Avatar src={comment.avatar} alt="avatar" className='mr-4' />
                            <div>
                                <p className='text-lg font-bold'>{comment.name}</p>
                                <p>{comment.content}</p>
                                <p className='text-gray-500 text-sm'>{new Date(comment.createdAt instanceof Timestamp ? comment.createdAt.toDate() : comment.createdAt).toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <Modal
                open={isExpanded}
                onClose={() => setIsExpanded(false)}
                className='flex items-center justify-center'
            >
                <div className='relative w-screen h-screen bg-white/70'>
                    <div className='text-white absolute cursor-pointer top-[10%] right-[30%] text-xl bg-slate-400 hover:bg-slate-600 rounded-full p-2' onClick={() => setIsExpanded(false)}>

                        <FaTimes />
                    </div>
                    {expandedImageIndex !== null && (
                        <img src={imageUrls[expandedImageIndex]} alt="detail_img" className='w-[600px] mx-auto mt-32' />
                    )}
                    <div className='absolute top-1/2 left-32 bg-slate-400 hover:bg-slate-600 rounded-full transform -translate-y-1/2'>
                        <IconButton onClick={() => setExpandedImageIndex((prev) => (prev === 0 ? post.imageUrls.length - 1 : (prev || 0) - 1))}>
                            <FaArrowLeft className='text-white' />
                        </IconButton>
                    </div>
                    <div className='absolute top-1/2 right-32 bg-slate-400 hover:bg-slate-600 rounded-full transform -translate-y-1/2'>
                        <IconButton onClick={() => setExpandedImageIndex((prev) => ((prev || 0) + 1) % post.imageUrls.length)}>
                            <FaArrowRight className='text-white' />
                        </IconButton>
                    </div>
                </div>
            </Modal>
            <Modal
                open={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                className='flex items-center justify-center'
            >
                <div className='bg-white p-4 rounded-md shadow-md'>
                    <h2 className='text-lg font-bold mb-4'>Chỉnh sửa bài viết</h2>
                    <TextField
                        label="Nội dung"
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        fullWidth
                        variant="outlined"
                        multiline
                        rows={4}
                    />
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => setNewImages(Array.from(e.target.files || []))}
                        className='mt-4'
                    />
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
