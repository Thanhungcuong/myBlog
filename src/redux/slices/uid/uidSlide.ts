import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface uidState {
    uid: string | null;
}

const initialState: uidState = {
    uid: localStorage.getItem('uid'),
};

const uidSlice = createSlice({
    name: 'uid',
    initialState,
    reducers: {
        setUid: (state, action: PayloadAction<string | null>) => {
            state.uid = action.payload;
        },
    },
});

export const { setUid } = uidSlice.actions;

export default uidSlice.reducer;