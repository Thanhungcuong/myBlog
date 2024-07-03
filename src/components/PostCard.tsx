import React, { useState } from 'react';
import { Avatar, Button, Modal, IconButton } from '@mui/material';
import { FaArrowLeft, FaArrowRight, FaTimes } from 'react-icons/fa';

interface Post {
    author: string;
    content: string;
    imageUrls: string[];
    avatar: string;
    createdAt: Date;
}

interface PostCardProps {
    post: Post;
}

const BASE_IMAGE_URL = "https://firebasestorage.googleapis.com/v0/b/my-blog-584c8.appspot.com/o/posts";

const PostCard: React.FC<PostCardProps> = ({ post }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const getFullImageUrl = (dynamicUrlPart: string) => {
        return `${BASE_IMAGE_URL}${dynamicUrlPart}`;
    };

    const handleOpenModal = (index: number) => {
        setCurrentImageIndex(index);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handlePrevImage = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : post.imageUrls.length - 1));
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex < post.imageUrls.length - 1 ? prevIndex + 1 : 0));
    };

    return (
        <div className="bg-cyan-300 shadow-md rounded-lg p-4 mb-20 w-full">
            <div className="flex items-center mb-4">
                <Avatar src={post.avatar} alt={post.author} className="w-10 h-10 mr-4" />
                <div>
                    <p className="font-bold">{post.author}</p>
                    <p className="text-gray-500 text-sm">{new Date(post.createdAt).toLocaleString()}</p>
                </div>
            </div>
            <div className="mb-4">
                <p>{post.content}</p>
            </div>
            {post.imageUrls.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {post.imageUrls.slice(0, 3).map((url, index) => (
                        <div key={index} className="relative mx-auto">
                            <img
                                src={getFullImageUrl(url)}
                                alt={`post-image-${index}`}
                                className="w-60 h-60 object-cover rounded-lg cursor-pointer"
                                onClick={() => handleOpenModal(index)}
                            />
                        </div>
                    ))}
                    {post.imageUrls.length > 3 && (
                        <div className="flex items-center justify-center">
                            <Button onClick={() => handleOpenModal(3)}>
                                +{post.imageUrls.length - 3} more
                            </Button>
                        </div>
                    )}
                </div>
            )}
            <Modal open={isModalOpen} onClose={handleCloseModal}>
                <div className="flex justify-center items-center relative w-screen h-screen bg-black bg-opacity-75" onClick={handleCloseModal}>
                    <div className=" max-w-3xl w-full">
                        <button
                            className="absolute top-1/2 left-[20%] transform -translate-y-1/2 text-white bg-gray-800 p-2 rounded-full"
                            onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                        >
                            <FaArrowLeft />
                        </button>


                        <FaTimes className='text-white absolute top-[20%] right-1/3' />

                        <img
                            src={getFullImageUrl(post.imageUrls[currentImageIndex])}
                            alt={`modal-image-${currentImageIndex}`}
                            className="w-full h-auto object-cover rounded-lg"
                        />

                        <button
                            className="absolute top-1/2 right-[20%] transform -translate-y-1/2 text-white bg-gray-800 p-2 rounded-full"
                            onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                        >
                            <FaArrowRight />
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default PostCard;
