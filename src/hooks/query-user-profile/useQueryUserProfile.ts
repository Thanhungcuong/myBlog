import { useEffect, useState } from "react";
import queryUserProfile from "../../utils/queryUserProfile";

interface UserProfile {
    email: string;
    uid: string;
    role: string;
    loginMethod: string;
    name: string;
    avatar: string;
}

export default function useQueryUserProfile(id: string) {
    const [userProfile, setUserProfile] = useState<UserProfile | undefined>(undefined);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await queryUserProfile({ id });
                setUserProfile(response);
            } catch (err) {
                setError('Failed to fetch user profile.');
            }
        };

        if (id) {
            fetchUserProfile();
        }
    }, [id]);

    return { userProfile, error };
}
