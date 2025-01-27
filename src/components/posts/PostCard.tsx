import React, { useState, useEffect, useRef, useCallback, } from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove, onSnapshot, deleteDoc, Timestamp } from 'firebase/firestore';
import { db, realtimeDb } from '../../firebaseConfig';
import useQueryUserProfile from '../../hooks/query-user-profile/useQueryUserProfile';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ref as rlRef, push } from "firebase/database";
import { useNavigate } from 'react-router-dom';
import ExpandedModal from '../modal/ExpandedModal';
import EditModal from '../modal/EditModal';
import DeleteModal from '../modal/DeleteModal';
import CommentComponent from '../comment/commentComponent';
import { v4 as uuidv4 } from 'uuid';
import { useSnackbar } from 'notistack';
import { RootState } from '../../redux/store';
import { useSelector } from 'react-redux';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { NotificationType } from '../../constant/enum';
import PostButton from './PostButton';
import PostImages from './PostImage';
import PostInfo from './PostInfo';
import PostAction from './PostAction';


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

interface PostCardProps {
    post: Post;
    initialShowComments?: boolean;
    initialVisibleCommentCount?: number;
}

interface Comment {
    uid: string;
    name: string;
    avatar: string;
    content: string;
    createdAt: Date | Timestamp;
}

const BASE_IMAGE_URL = "https://firebasestorage.googleapis.com/v0/b/my-blog-584c8.appspot.com/o/posts";

const PostCard: React.FC<PostCardProps> = ({ post, initialShowComments = false, initialVisibleCommentCount = 10 }) => {
    const [expandedImageIndex, setExpandedImageIndex] = useState<number | null>(null);
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const [likeCount, setLikeCount] = useState<number>(post.likes.length);
    const [isLiked, setIsLiked] = useState<boolean>(false);
    const [showComments, setShowComments] = useState<boolean>(initialShowComments);
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
    const dropdownOption = useRef<HTMLDivElement>(null);

    const uid = useSelector((state: RootState) => state.uid.uid);
    const { userProfile, error: userProfileError } = useQueryUserProfile(uid || '');

    const [visibleComments, setVisibleComments] = useState<{ [key: number]: boolean }>({});
    const [visibleCommentCount, setVisibleCommentCount] = useState<number>(initialVisibleCommentCount);

    const { enqueueSnackbar } = useSnackbar();

    const [currentPackage, setCurrentPackage] = useState<string>('Gói mặc định');


    const navigate = useNavigate();
    const handleToggleVisibility = (index: number) => {
        setVisibleComments((prevState) => ({
            ...prevState,
            [index]: true
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
        if (!uid) return;

        const fetchPackage = async () => {
            try {
                const q = query(collection(db, 'subscriptions'), where('uid', '==', uid));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const docSnap = querySnapshot.docs[0];
                    const data = docSnap.data();
                    setCurrentPackage(data.package || 'Gói mặc định');
                } else {
                    setCurrentPackage('Gói mặc định');
                }
            } catch (error) {
                console.error('Error fetching package:', error);
                setCurrentPackage('Gói mặc định');
            }
        };

        fetchPackage();
    }, [uid]);

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
                    id: uuidv4(),
                    user: userProfile.name,
                    type: NotificationType.LIKE,
                    postId: post.id,
                    timestamp: new Date().toISOString(),
                    seen: false,
                    snackBar: false,
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
                    id: uuidv4(),
                    user: userProfile.name,
                    type: NotificationType.COMMENT,
                    postId: post.id,
                    timestamp: new Date().toISOString(),
                    seen: false,
                    snackBar: false,
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
            enqueueSnackbar('Chỉnh sửa bài viết thành công!', {
                variant: 'success',
                anchorOrigin: { vertical: 'top', horizontal: 'right' },
                autoHideDuration: 2000
            });
        } catch (err) {
            console.error('Error updating post:', err);
            setError('Failed to update post.');
            enqueueSnackbar('Chỉnh sửa bài viết thất bại. Hãy thử lại!', {
                variant: 'error',
                anchorOrigin: { vertical: 'top', horizontal: 'right' },
                autoHideDuration: 2000
            });
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

    const loadMoreComments = () => {
        setVisibleCommentCount((prevCount) => prevCount + 10);
    };

    const handleClickPost = (id: string) => {
        navigate(`/post/${id}`);
    }


    return (
        <div className=' p-8 max-sm:p-4 bg-white rounded-md shadow-md shadow-black/10 border relative w-2/3 max-sm:w-11/12 '>
            <div className='flex items-center justify-between'>
                <PostInfo
                    avatar={post.avatar}
                    createdAt={post.createdAt}
                    name={post.author}
                    currentPackage={currentPackage}
                    id={post.id}
                    handleClickPost={handleClickPost}
                />
                {uid === post.uid && (
                    <PostAction
                        setIsEditModalOpen={setIsEditModalOpen}
                        setIsDeleteModalOpen={setIsDeleteModalOpen}
                    />
                )}
            </div>

            <p className='mt-4'>{post.content}</p>

            <PostImages
                imageUrls={imageEdited}
                setExpandedImageIndex={setExpandedImageIndex}
                setIsExpanded={setIsExpanded}
            />


            <PostButton
                toggleLike={toggleLike}
                isLiked={isLiked}
                likeCount={likeCount}
                showComments={showComments}
                setShowComments={setShowComments}
                commentsLength={comments.length}
            />
            {showComments && (
                <CommentComponent
                    comments={comments}
                    visibleCommentCount={visibleCommentCount}
                    visibleComments={visibleComments}
                    newComment={newComment}
                    truncateText={truncateText}
                    handleToggleVisibility={handleToggleVisibility}
                    loadMoreComments={loadMoreComments}
                    handleCommentSubmit={handleCommentSubmit}
                    setNewComment={setNewComment}
                />
            )}
            {expandedImageIndex !== null && (
                <ExpandedModal
                    isExpanded={isExpanded}
                    onClose={() => setIsExpanded(false)}
                    imageUrls={imageUrls}
                    expandedImageIndex={expandedImageIndex}
                    setExpandedImageIndex={setExpandedImageIndex}
                />
            )}
            <EditModal
                isEditModalOpen={isEditModalOpen}
                setIsEditModalOpen={setIsEditModalOpen}
                editedContent={editedContent}
                setEditedContent={setEditedContent}
                handleFileChange={handleFileChange}
                handleRemoveImage={handleRemoveImage}
                imageEdited={imageEdited}
                handleEditPost={handleEditPost}
                handleDrop={handleDrop}
            />
            <DeleteModal
                openModal={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                cancelButton={() => setIsDeleteModalOpen(false)}
                deteleButton={handleDeletePost}
            />
        </div>
    );
};

export default PostCard;