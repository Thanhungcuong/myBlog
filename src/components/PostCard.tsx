import React, { useState, useEffect } from 'react';
import { Avatar, Button, Modal, IconButton, TextField } from '@mui/material';
import { FaArrowLeft, FaArrowRight, FaTimes, FaThumbsUp, FaComment } from 'react-icons/fa';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import useQueryUserProfile from '../hooks/query-user-profile/useQueryUserProfile';

interface Post {
    id: string;
    uid: string;
    author: string;
    content: string;
    imageUrls: string[];
    avatar: string;
    createdAt: Date;
    likes: string[];
    comments: Comment[];
}

interface Comment {
    uid: string;
    name: string;
    avatar: string;
    content: string;
    createdAt: Date;
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

    const uid = localStorage.getItem('uid');
    const { userProfile, error: userProfileError } = useQueryUserProfile(uid || '');

    useEffect(() => {
        if (userProfile && post.likes.includes(userProfile.uid)) {
            setIsLiked(true);
        }
        // Fetch image URLs
        const fetchImageUrls = async () => {
            const urls = await Promise.all(
                post.imageUrls.map(async (dynamicUrlPart) => {
                    return await getFullImageUrl(dynamicUrlPart);
                })
            );
            setImageUrls(urls);
        };
        fetchImageUrls();
    }, [userProfile, post.likes, post.imageUrls]);

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

            setIsLiked(!isLiked);
            setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
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

            setComments([...comments, comment]);
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

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className='max-w-[600px] mx-auto p-4 bg-white rounded-md shadow-md relative'>
            <div className='flex items-center'>
                <Avatar src={post.avatar} alt="avatar" className='mr-4' />
                <div>
                    <p className='text-lg font-bold'>{post.author}</p>
                    <p className='text-gray-500'>{new Date(post.createdAt).toLocaleString()}</p>
                </div>
            </div>
            <p className='mt-4'>{post.content}</p>
            <div className='grid grid-cols-3 gap-2 mt-4'>
                {imageUrls.map((url, index) => (
                    <div key={index} className='relative'>
                        <img src={url} alt="post_img" className='w-60 h-60 object-cover' />
                        <div className='absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer' onClick={() => { setExpandedImageIndex(index); setIsExpanded(true); }}>
                            <FaArrowRight className='text-white text-2xl' />
                        </div>
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
                    <TextField
                        label="Add a comment"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        fullWidth
                        variant="outlined"
                    />
                    <Button onClick={handleCommentSubmit} className='mt-2'>Submit</Button>
                    {comments.map((comment, index) => (
                        <div key={index} className='flex items-start mt-4'>
                            <Avatar src={comment.avatar} alt="avatar" className='mr-4' />
                            <div>
                                <p className='text-lg font-bold'>{comment.name}</p>
                                <p>{comment.content}</p>
                                <p className='text-gray-500 text-sm'>{new Date(comment.createdAt).toLocaleString()}</p>
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
                <div className='relative'>
                    <IconButton onClick={() => setIsExpanded(false)} className='absolute top-2 right-2'>
                        <FaTimes className='text-white' />
                    </IconButton>
                    {expandedImageIndex !== null && (
                        <img src={imageUrls[expandedImageIndex]} alt="detail_img" className='w-full h-auto' />
                    )}
                    <div className='absolute top-1/2 left-2 transform -translate-y-1/2'>
                        <IconButton onClick={() => setExpandedImageIndex((prev) => (prev === 0 ? post.imageUrls.length - 1 : (prev || 0) - 1))}>
                            <FaArrowLeft className='text-white' />
                        </IconButton>
                    </div>
                    <div className='absolute top-1/2 right-2 transform -translate-y-1/2'>
                        <IconButton onClick={() => setExpandedImageIndex((prev) => ((prev || 0) + 1) % post.imageUrls.length)}>
                            <FaArrowRight className='text-white' />
                        </IconButton>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default PostCard;
