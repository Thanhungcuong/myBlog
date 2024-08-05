import React from 'react';
import { IconButton } from '@mui/material';
import { FaTimes } from 'react-icons/fa';

interface PostImagesProps {
    imageUrls: string[];
    setExpandedImageIndex: (index: number) => void;
    setIsExpanded: (expanded: boolean) => void;
}

const PostImages: React.FC<PostImagesProps> = ({
    imageUrls,
    setExpandedImageIndex,
    setIsExpanded

}) => {
    return (
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
    );
};

export default PostImages;
