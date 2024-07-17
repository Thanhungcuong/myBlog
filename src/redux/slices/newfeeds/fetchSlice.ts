import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, getDocs, query, orderBy, limit, startAfter } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

interface Post {
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

interface Comment {
  uid: string;
  name: string;
  avatar: string;
  content: string;
  createdAt: Date;
}

interface PostState {
  posts: Post[];
  loading: boolean;
  error: string | null;
  lastVisible: any;
  hasMore: boolean;
}

const initialState: PostState = {
  posts: [],
  loading: false,
  error: null,
  lastVisible: null,
  hasMore: true,
};

export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async (lastVisible: any) => {
    let q;
    if (lastVisible) {
      q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), startAfter(lastVisible), limit(10));
    } else {
      q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(10));
    }

    const querySnapshot = await getDocs(q);
    const posts: Post[] = [];
    querySnapshot.forEach(doc => {
      const data = doc.data();
      posts.push({
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

    return { posts, lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1] };
  }
);

const fetchSlice  = createSlice({
  name: 'posts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = state.lastVisible ? [...state.posts, ...action.payload.posts] : action.payload.posts;
        state.lastVisible = action.payload.lastVisible;
        state.hasMore = action.payload.posts.length === 10;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch posts';
      });
  },
});

export default fetchSlice.reducer;
