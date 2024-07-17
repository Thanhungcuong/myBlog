import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { doc, setDoc } from 'firebase/firestore';
import { db, storage } from '../../../firebaseConfig';
import { ref, uploadBytes } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

interface PostState {
  loading: boolean;
  error: string | null;
}

const initialState: PostState = {
  loading: false,
  error: null,
};

export const createPost = createAsyncThunk(
  'posts/createPost',
  async ({ postContent, imageFiles, userProfile, uid }: { postContent: string; imageFiles: File[]; userProfile: any; uid: string }) => {
    const uploadedImageFilenames = await Promise.all(
      imageFiles.map(async (file) => {
        const storageRef = ref(storage, `posts/${uid}/${file.name}`);
        await uploadBytes(storageRef, file);
        return file.name;
      })
    );

    const newPost = {
      content: postContent,
      imageUrls: uploadedImageFilenames,
      author: userProfile.name,
      createdAt: new Date(),
      updateAt: null,
      uid: uid,
      id: uuidv4(),
      likes: [],
      comments: [],
      avatar: userProfile.avatar,
    };

    await setDoc(doc(db, 'posts', newPost.id), newPost);
    return newPost;
  }
);

const uploadSlice  = createSlice({
  name: 'posts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create post';
      });
  },
});

export default uploadSlice.reducer;