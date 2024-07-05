import React, { useState, useEffect } from "react";
import { logOut } from "../../auth/authService";
import { useNavigate } from "react-router-dom";
import PostArea from "../../components/PostArea";
import PostCard from "../../components/PostCard";
import { db } from "../../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

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
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "posts"));
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
            } catch (err) {
                console.error("Error fetching posts:", err);
                setError("Failed to fetch posts.");
            }
        };

        fetchPosts();
    }, []);

    return (
        <div className="container max-w-[1440px] mx-auto p-4 last:">
            <div className="mb-12">
                <PostArea />
            </div>

            {error && <div className="text-red-500">{error}</div>}
            {posts.map((post) => (
                <div key={post.id} className="flex flex-col p-4 justify-center items-center">
                    <PostCard post={post} />
                </div>
            ))}
        </div>
    );
};

export default Home;
