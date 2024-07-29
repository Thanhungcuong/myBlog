import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import uploadReducer from './slices/postArea/uploadSlice';
import fetchReducer from './slices/newfeeds/fetchSlice';
import userProfileReducer from './slices/idividual/userProfileSlice';
import userPostsReducer from './slices/idividual/userPostsSlice';
import updateProfileReducer from './slices/settingUser/updateProfileSlice';
import uidReducer from './slices/uid/uidSlide'
import subscriptionReducer from './slices/uploadSubscription/uploadSubscription';

const store = configureStore({
    reducer: {
        upload: uploadReducer,
        fetch: fetchReducer,
        userProfile: userProfileReducer,
        userPosts: userPostsReducer,
        updateProfile: updateProfileReducer,
        uid: uidReducer,
        subscription: subscriptionReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
export const useAppDispatch: () => AppDispatch = useDispatch;
export default store;
