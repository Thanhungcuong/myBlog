import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PostArea from "../../components/posts/PostArea";
import PostCard from "../../components/posts/PostCard";
import HomeSkeleton from "../../components/skeleton/HomeSkeleton";
import { db } from "../../firebaseConfig";
import { collection, onSnapshot, orderBy, query, limit, startAfter } from "firebase/firestore";

export interface Comment {
    uid: string;
    name: string;
    avatar: string;
    content: string;
    createdAt: Date;
}

export interface Post {
    id: string;
    author: string;
    content: string;
    imageUrls: string[];
    avatar: string;
    createdAt: Date;
    likes: string[];
    comments: Comment[];
    uid: string;
}

const Home: React.FC = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [lastVisible, setLastVisible] = useState<any>(null);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const observer = useRef<IntersectionObserver | null>(null);

    const fetchPosts = (initial = false) => {
        setLoading(true);
        let q;
        if (initial) {
            q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(10));
        } else {
            q = query(collection(db, "posts"), orderBy("createdAt", "desc"), startAfter(lastVisible), limit(10));
        }

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedPosts: Post[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                fetchedPosts.push({
                    id: doc.id,
                    author: data.author,
                    content: data.content,
                    imageUrls: data.imageUrls,
                    avatar: data.avatar,
                    createdAt: data.createdAt.toDate(),
                    likes: data.likes,
                    comments: data.comments.map((comment: any) => ({
                        ...comment,
                        createdAt: comment.createdAt.toDate()
                    })),
                    uid: data.uid,
                });
            });

            if (initial) {
                setPosts(fetchedPosts);
            } else {
                setPosts((prevPosts) => [...prevPosts, ...fetchedPosts]);
            }

            setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);

            if (querySnapshot.size < 10) {
                setHasMore(false);
            }

            setLoading(false);
        }, (error) => {
            console.error("Error fetching posts:", error);
            setError("Failed to fetch posts.");
            setLoading(false);
        });

        return unsubscribe;
    };

    useEffect(() => {
        fetchPosts(true);
    }, []);

    const handlePostUpdate = (updatedPost: Post) => {
        setPosts(prevPosts => prevPosts.map(post => post.id === updatedPost.id ? updatedPost : post));
    };

    const loadMorePosts = () => {
        if (hasMore) {
            fetchPosts();
        }
    };

    const lastPostElementRef = useCallback((node: any) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore) {
                loadMorePosts();
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    if (loading && posts.length === 0) {
        return <HomeSkeleton />
    }

    return (
        <div className="container max-w-[1440px] mx-auto p-4">
            {error && <div className="text-red-500">{error}</div>}
            <div>
                <div className="mb-12">
                    <PostArea />
                </div>
                <div>
                    {posts.map((post, index) => (
                        <div ref={posts.length === index + 1 ? lastPostElementRef : null} key={post.id} className="flex flex-col mb-4 justify-center items-center">
                            <PostCard post={post} />
                        </div>
                    ))}
                </div>
            </div>
            {loading && <HomeSkeleton />}
        </div>
    );
};

export default Home;
