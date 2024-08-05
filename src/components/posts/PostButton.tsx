import React from 'react';
import { IconButton } from '@mui/material';
import { FaThumbsUp, FaComment } from 'react-icons/fa';

interface PostButtonProps {
    toggleLike: () => void;
    isLiked: boolean;
    likeCount: number;
    showComments: boolean;
    setShowComments: (show: boolean) => void;
    commentsLength: number;
}

const PostButton: React.FC<PostButtonProps> = ({ toggleLike, isLiked, likeCount, showComments, setShowComments, commentsLength }) => {
    return (
        <div className='flex justify-between items-center my-10 border-y-2 py-4'>
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
                <span>{commentsLength}</span>
            </div>
        </div>
    );
};

export default PostButton;
