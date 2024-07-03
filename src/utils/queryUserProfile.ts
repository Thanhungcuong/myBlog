import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

interface UserProfile {
    email: string;
    uid: string;
    role: string;
    loginMethod: string;
    name: string;
    avatar: string;
}

const queryUserProfile = async ({ id }: { id: string }): Promise<UserProfile> => {
    try {
        const userRef = doc(db, 'users', id);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) throw new Error('User does not exist.');
        return userDoc.data() as UserProfile;
    } catch (err) {
        throw new Error('Failed to fetch user profile.');
    }
};

export default queryUserProfile;
