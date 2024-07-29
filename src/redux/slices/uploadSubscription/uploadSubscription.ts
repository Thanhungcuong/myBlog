import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../../firebaseConfig';
import { v4 as uuidv4 } from 'uuid';
import { FormData } from '../../../constant/type/FormData';
import { RootState } from '../../store';

interface SubscriptionState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: SubscriptionState = {
  loading: false,
  error: null,
  success: false,
};

export const uploadSubscription = createAsyncThunk(
  'subscription/uploadSubscription',
  async (formData: FormData, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const uid = state.uid.uid;

    try {
      const uploadFile = async (file: File, folder: string) => {
        const storageRef = ref(storage, `${folder}/${uuidv4()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        return downloadURL;
      };

      const uploadFiles = async () => {
        const folder = 'subscription';
        const personalPhotoUrl = formData.personalPhoto ? await uploadFile(formData.personalPhoto, folder) : null;
        const cccdPhotoFrontUrl = formData.cccdPhotoFront ? await uploadFile(formData.cccdPhotoFront, folder) : null;
        const cccdPhotoBackUrl = formData.cccdPhotoBack ? await uploadFile(formData.cccdPhotoBack, folder) : null;
        const transactionImageUrl = formData.transactionImage ? await uploadFile(formData.transactionImage, folder) : null;

        return { personalPhotoUrl, cccdPhotoFrontUrl, cccdPhotoBackUrl, transactionImageUrl };
      };

      const fileUrls = await uploadFiles();

      const subscriptionData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        package: formData.package,
        personalPhotoUrl: fileUrls.personalPhotoUrl,
        cccdPhotoFrontUrl: fileUrls.cccdPhotoFrontUrl,
        cccdPhotoBackUrl: fileUrls.cccdPhotoBackUrl,
        transactionImageUrl: fileUrls.transactionImageUrl,
        createdAt: new Date(),
        uid: uid,
      };

      console.log('Saving to Firestore:', subscriptionData);
      await setDoc(doc(db, 'subscriptions', uuidv4()), subscriptionData);
      console.log('Saved to Firestore successfully');

      return subscriptionData;
    } catch (error) {
      console.error('Error uploading subscription:', error);
      return rejectWithValue('Failed to upload subscription');
    }
  }
);

const uploadSubscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    resetStatus: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(uploadSubscription.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(uploadSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to upload subscription';
        state.success = false;
      });
  },
});

export const { resetStatus } = uploadSubscriptionSlice.actions;

export default uploadSubscriptionSlice.reducer;
