import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import PostCard from '../../components/posts/PostCard';

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

const DetailPost: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                if (id) {
                    const postRef = doc(db, 'posts', id);
                    const postSnap = await getDoc(postRef);
                    if (postSnap.exists()) {
                        const postData = postSnap.data() as Post;
                        setPost({
                            ...postData,
                            id: postSnap.id,
                            createdAt: postData.createdAt instanceof Timestamp ? postData.createdAt.toDate() : postData.createdAt,
                            comments: postData.comments.map(comment => ({
                                ...comment,
                                createdAt: comment.createdAt instanceof Timestamp ? comment.createdAt.toDate() : comment.createdAt
                            }))
                        });
                    } else {
                        setError('Post not found');
                    }
                }
            } catch (err) {
                console.error('Error fetching post:', err);
                setError('Failed to fetch post.');
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className='flex justify-center items-center'>
            {post ? (
                <PostCard
                    post={post}
                    initialShowComments={true}
                    initialVisibleCommentCount={post.comments.length}
                />
            ) : (
                <div>Post not found</div>
            )}
        </div>
    );
};

export default DetailPost;
