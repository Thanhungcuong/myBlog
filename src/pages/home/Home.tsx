import React, { useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store";
import PostArea from "../../components/posts/PostArea";
import PostCard from "../../components/posts/PostCard";
import HomeSkeleton from "../../components/skeleton/HomeSkeleton";
import { fetchPosts } from "../../redux/slices/newfeeds/fetchSlice";

const Home: React.FC = () => {
    const dispatch: AppDispatch = useDispatch();
    const { posts, loading, error, hasMore, lastVisible } = useSelector((state: RootState) => state.fetch);
    const observer = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        dispatch(fetchPosts(null));
    }, [dispatch]);

    const loadMorePosts = () => {
        if (hasMore) {
            dispatch(fetchPosts(lastVisible));
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
        return <HomeSkeleton />;
    }

    return (
        <div className="container max-w-[1440px] mx-auto sm:p-4">
            {error && <div className="text-red-500">{error}</div>}
            <div>
                <div className="mb-12">
                    <PostArea />
                </div>
                <div>
                    {posts.map((post, index) => (
                        <div
                            ref={posts.length === index + 1 ? lastPostElementRef : null}
                            key={post.id}
                            className="flex flex-col mb-4 justify-center items-center"
                        >
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
