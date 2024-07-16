import React, { useState, useEffect } from 'react';
import { Avatar, Button } from '@mui/material';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import PostCard from '../../components/posts/PostCard';
import { useNavigate } from 'react-router-dom';
import IndividualSkeleton from '../../components/skeleton/IndividualSkeleton';
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

const IndividualPage: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [userProfile, setUserProfile] = useState<any>(null);
    const navigate = useNavigate();
    const uid = localStorage.getItem('uid');
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!uid) return;
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
                setUserProfile(userDoc.data());
            }
        };

        const fetchUserPosts = async () => {
            if (!uid) return;
            const postsQuery = query(collection(db, 'posts'), where('uid', '==', uid));
            const querySnapshot = await getDocs(postsQuery);
            const fetchedPosts = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt.toDate(),
            })) as Post[];
            setPosts(fetchedPosts);
            setLoading(false);
        };

        fetchUserProfile();
        fetchUserPosts();
    }, [uid]);

    const handleClickSetting = () => {

        navigate(`/settings`);

    }

    if (loading || !userProfile) {
        return <IndividualSkeleton />;
    }

    return (
        <div className="flex flex-col items-center mt-5 bg-[#fefefe]">

            <div className=" flex flex-col items-center relative mb-20 w-2/3 max-sm:w-full max-2xl:w-4/5">

                <div className="w-full ">

                    <div className="  mx-auto h-64">
                        {userProfile.coverPhotoUrl ? (
                            <img src={userProfile.coverPhotoUrl} alt="Cover" className="w-full h-full " />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                                Hãy cài đặt để thêm ảnh bìa
                            </div>
                        )}
                    </div>

                </div>

                <div className='flex max-lg:flex-col relative items-center justify-around w-full'>


                    <div className=' my-4 lg:ml-auto max-lg:mt-32 h-16  w-fit container flex '>

                        <button className='bg-slate-200 hover:bg-slate-300 p-4 rounded-lg text-lg max-xl:text-base text-blue-700 font-semibold ' onClick={() => handleClickSetting()}>Chỉnh sửa trang cá nhân</button>
                    </div>

                </div>

                <div className=" flex gap-5 z-50 absolute bottom-0 max-lg:bottom-1/4 left-[10%]">
                    <img src={userProfile.avatar} alt="Avatar" className="w-40 h-40 border-4 border-white rounded-full" />
                    <div className='mt-auto'>

                        <h1 className="text-2xl max-sm:text-xl font-bold text-nowrap">{userProfile.name}</h1>
                        <h2 className='text-xl'>{userProfile.bio}</h2>
                        <h2 className='text-xl'>{userProfile.birthday}</h2>
                    </div>
                </div>

            </div>

            <div className='container max-w-[1440px] mx-auto '>
                {posts.map((post) => (
                    <div key={post.id} className="flex flex-col p-4 justify-center items-center">

                        <PostCard key={post.id} post={post} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default IndividualPage;
