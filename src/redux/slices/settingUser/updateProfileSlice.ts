import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

interface UserProfile {
    name: string;
    bio: string;
    birthday: string;
    avatar: string;
    coverPhotoUrl: string;
}

interface UpdateProfileState {
    profile: UserProfile | null;
    loading: boolean;
    error: string | null;
}

const initialState: UpdateProfileState = {
    profile: null,
    loading: false,
    error: null,
};

export const updateUserProfile = createAsyncThunk(
    'profile/updateUserProfile',
    async ({ uid, profileData }: { uid: string, profileData: Partial<UserProfile> }) => {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, profileData);
        return { uid, profileData };
    }
);

const updateProfileSlice = createSlice({
    name: 'updateProfile',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(updateUserProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUserProfile.fulfilled, (state, action: PayloadAction<{ uid: string, profileData: Partial<UserProfile> }>) => {
                state.loading = false;
                if (state.profile) {
                    state.profile = { ...state.profile, ...action.payload.profileData };
                }
            })
            .addCase(updateUserProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to update profile';
            });
    },
});

export default updateProfileSlice.reducer;
