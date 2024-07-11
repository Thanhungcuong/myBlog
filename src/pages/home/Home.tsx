import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PostArea from "../../components/posts/PostArea";
import PostCard from "../../components/posts/PostCard";
import HomeSkeleton from "../../components/skeleton/HomeSkeleton";
import { db } from "../../firebaseConfig";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

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

    useEffect(() => {
        const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
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
            setPosts(fetchedPosts);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching posts:", error);
            setError("Failed to fetch posts.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
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
                    {posts && posts.map((post) => (
                        <div key={post.id} className="flex flex-col p-4 justify-center items-center">
                            <PostCard post={post} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;
