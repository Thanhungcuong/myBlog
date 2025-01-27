import React, { useEffect, useState } from 'react';
import { Avatar, Button, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import PostCard from '../../components/posts/PostCard';
import IndividualSkeleton from '../../components/skeleton/IndividualSkeleton';
import { fetchUserProfile } from '../../redux/slices/idividual/userProfileSlice';
import { fetchUserPosts } from '../../redux/slices/idividual/userPostsSlice';
import { RootState, AppDispatch } from '../../redux/store';
import PostArea from '../../components/posts/PostArea';
import { db } from '../../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { FaCheck } from 'react-icons/fa';

const IndividualPage: React.FC = () => {
    const dispatch: AppDispatch = useDispatch();
    const navigate = useNavigate();
    const uid = useSelector((state: RootState) => state.uid.uid);
    const { profile, loading: profileLoading } = useSelector((state: RootState) => state.userProfile);
    const { posts, loading: postsLoading } = useSelector((state: RootState) => state.userPosts);

    const [currentPackage, setCurrentPackage] = useState<string>('Gói mặc định');

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

        dispatch(fetchUserProfile(uid));
        dispatch(fetchUserPosts(uid));
        fetchPackage();
    }, [dispatch, uid]);

    const handleClickSetting = () => {
        navigate('/edit-profile');
    };

    if (profileLoading || postsLoading || !profile) {
        return <IndividualSkeleton />;
    }

    const renderName = () => {
        let nameStyle = "text-xl font-bold text-nowrap";
        let nameContent = <span>{profile.name}</span>;

        switch (currentPackage) {
            case 'Gói VIP':
                nameStyle = "text-2xl max-sm:text-xl font-bold text-nowrap text-blue-700";
                nameContent = <span>{profile.name} <FaCheck className="inline text-green-500" /></span>;
                break;
            case 'Gói tên':
                nameStyle = "text-2xl max-sm:text-xl font-bold text-nowrap text-blue-700";
                break;
            case 'Gói tick xanh':
                nameContent = <span>{profile.name} <FaCheck className="inline text-green-500" /></span>;
                break;
            default:
                nameStyle = "text-2xl max-sm:text-xl font-bold text-nowrap";
                break;
        }

        return <h1 className={nameStyle}>{nameContent}</h1>;
    };

    return (
        <div className="flex flex-col items-center mt-5 bg-[#fefefe]">
            <div className="flex flex-col items-center relative mb-20 w-2/3 max-sm:w-full max-2xl:w-4/5 border-2 rounded-lg h-96">
                <div className="w-full">
                    <div className="mx-auto h-64">
                        {profile.coverPhotoUrl ? (
                            <img src={profile.coverPhotoUrl} alt="Cover" className="w-full h-full rounded-t-lg overflow-hidden" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                                Hãy cài đặt để thêm ảnh bìa
                            </div>
                        )}
                    </div>
                </div>
                <div className='flex max-lg:flex-col relative items-center justify-around w-full overflow-hidden'>
                    <div className='my-4 lg:ml-auto max-lg:mt-32 h-16 w-fit container flex'>
                        <button className='bg-slate-200 hover:bg-slate-300 p-4 rounded-lg text-lg max-xl:text-base text-blue-700 font-semibold mr-10' onClick={() => handleClickSetting()}>Chỉnh sửa trang cá nhân</button>
                    </div>
                </div>
                <div className="flex gap-5 z-50 absolute bottom-[10%] max-lg:bottom-1/4 left-[10%]">
                    <img src={profile.avatar} alt="Avatar" className="w-40 h-40 border-4 border-white rounded-full" />
                    <div className='mt-auto'>
                        {renderName()}
                        <h2 className='text-xl'>{profile.bio}</h2>
                        <h2 className='text-xl'>{profile.birthday}</h2>
                    </div>
                </div>
            </div>
            <div className='container max-w-[1440px] mx-auto py-10'>
                <PostArea />
            </div>
            <div className='container max-w-[1440px] mx-auto'>
                {posts.map((post) => (
                    <div key={post.id} className="flex flex-col justify-center items-center">
                        <PostCard key={post.id} post={post} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default IndividualPage;
