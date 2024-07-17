import React, { useEffect } from 'react';
import { Avatar, Button } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import PostCard from '../../components/posts/PostCard';
import IndividualSkeleton from '../../components/skeleton/IndividualSkeleton';
import { fetchUserProfile } from '../../redux/slices/idividual/userProfileSlice';
import { fetchUserPosts } from '../../redux/slices/idividual/userPostsSlice';
import { RootState, AppDispatch } from '../../redux/store';

const IndividualPage: React.FC = () => {
    const dispatch: AppDispatch = useDispatch();
    const navigate = useNavigate();
    const uid = localStorage.getItem('uid');

    const { profile, loading: profileLoading } = useSelector((state: RootState) => state.userProfile);
    const { posts, loading: postsLoading } = useSelector((state: RootState) => state.userPosts);

    useEffect(() => {
        if (uid) {
            dispatch(fetchUserProfile(uid));
            dispatch(fetchUserPosts(uid));
        }
    }, [dispatch, uid]);

    const handleClickSetting = () => {
        navigate(`/settings`);
    };

    if (profileLoading || postsLoading || !profile) {
        return <IndividualSkeleton />;
    }

    return (
        <div className="flex flex-col items-center mt-5 bg-[#fefefe]">
            <div className="flex flex-col items-center relative mb-20 w-2/3 max-sm:w-full max-2xl:w-4/5">
                <div className="w-full">
                    <div className="mx-auto h-64">
                        {profile.coverPhotoUrl ? (
                            <img src={profile.coverPhotoUrl} alt="Cover" className="w-full h-full" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                                Hãy cài đặt để thêm ảnh bìa
                            </div>
                        )}
                    </div>
                </div>
                <div className='flex max-lg:flex-col relative items-center justify-around w-full'>
                    <div className='my-4 lg:ml-auto max-lg:mt-32 h-16 w-fit container flex'>
                        <button className='bg-slate-200 hover:bg-slate-300 p-4 rounded-lg text-lg max-xl:text-base text-blue-700 font-semibold' onClick={() => handleClickSetting()}>Chỉnh sửa trang cá nhân</button>
                    </div>
                </div>
                <div className="flex gap-5 z-50 absolute bottom-0 max-lg:bottom-1/4 left-[10%]">
                    <img src={profile.avatar} alt="Avatar" className="w-40 h-40 border-4 border-white rounded-full" />
                    <div className='mt-auto'>
                        <h1 className="text-2xl max-sm:text-xl font-bold text-nowrap">{profile.name}</h1>
                        <h2 className='text-xl'>{profile.bio}</h2>
                        <h2 className='text-xl'>{profile.birthday}</h2>
                    </div>
                </div>
            </div>
            <div className='container max-w-[1440px] mx-auto'>
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
