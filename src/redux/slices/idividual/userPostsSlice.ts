import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

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

interface UserPostsState {
  posts: Post[];
  loading: boolean;
  error: string | null;
}

const initialState: UserPostsState = {
  posts: [],
  loading: false,
  error: null,
};

export const fetchUserPosts = createAsyncThunk(
  'userPosts/fetchUserPosts',
  async (uid: string) => {
    const postsQuery = query(collection(db, 'posts'), where('uid', '==', uid));
    const querySnapshot = await getDocs(postsQuery);
    const fetchedPosts = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
    })) as Post[];
    return fetchedPosts;
  }
);

const userPostsSlice = createSlice({
  name: 'userPosts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(fetchUserPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch user posts';
      });
  },
});

export default userPostsSlice.reducer;
