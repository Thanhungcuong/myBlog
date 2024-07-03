import React, { useState, useEffect } from "react";
import { logOut } from "../../auth/authService";
import { useNavigate } from "react-router-dom";
import PostArea from "../../components/PostArea";
import PostCard from "../../components/PostCard";
import { db } from "../../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

interface Post {
    author: string;
    content: string;
    imageUrls: string[];
    avatar: string;
    createdAt: Date;
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
                        author: data.author,
                        content: data.content,
                        imageUrls: data.imageUrls,
                        avatar: data.avatar,
                        createdAt: data.createdAt.toDate(),
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

    const handleLogout = async () => {
        try {
            await logOut();
            navigate("/login");
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    return (
        <div className="max-w-[1440px] mx-auto p-4">
            <div className="mb-12">
                <PostArea />
            </div>

            {error && <div className="text-red-500">{error}</div>}
            {posts.map((post, index) => (
                <div className="flex flex-col justify-center items-center gap-12 w-full">
                    <PostCard key={index} post={post} />
                </div>

            ))}
        </div>
    );
};

export default Home;
