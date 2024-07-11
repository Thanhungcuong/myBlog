import { auth, db } from "../firebaseConfig";
import {
    signInWithPopup,
    GoogleAuthProvider,
    FacebookAuthProvider,
    GithubAuthProvider,
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
    User
} from "firebase/auth";
import {
    doc,
    getDoc,
    setDoc
} from "firebase/firestore";
import bcrypt from "bcryptjs";

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const githubProvider = new GithubAuthProvider();

const saveUserToFirestore = async (user: User, method: string) => {
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
        await setDoc(userRef, {
            email: user.email,
            uid: user.uid,
            role: "user",
            loginMethod: method,
            name: user.displayName || `User_${Math.floor(Math.random() * 1000)}`,
            avatar: user.photoURL || "https://img.freepik.com/free-psd/3d-illustration-human-avatar-profile_23-2150671142.jpg?size=338&ext=jpg&ga=GA1.1.1141335507.1719446400&semt=ais_user",
            cover: null,
            bio: null,
            birthday: null,
        });
        console.log("User saved to Firestore:", user);
    } else {
        console.log("User already exists in Firestore");
    }
};

export const signInWithGoogle = async (): Promise<User | null> => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken;
        const user = result.user;
        if (token) {
            localStorage.setItem("jwt", token);
        }
        await saveUserToFirestore(user, "google");
        localStorage.setItem("uid", user.uid);
        return user;
    } catch (error) {
        console.error("Error signing in with Google:", error);
        throw error;
    }
};

export const signInWithFacebook = async (): Promise<User | null> => {
    try {
        const result = await signInWithPopup(auth, facebookProvider);
        const credential = FacebookAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken;
        const user = result.user;
        if (token) {
            localStorage.setItem("jwt", token);
        }
        await saveUserToFirestore(user, "facebook");
        localStorage.setItem("uid", user.uid);
        return user;
    } catch (error) {
        console.error("Error signing in with Facebook:", error);
        throw error;
    }
};

export const signInWithGithub = async (): Promise<User | null> => {
    try {
        const result = await signInWithPopup(auth, githubProvider);
        const credential = GithubAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken;
        const user = result.user;
        if (token) {
            localStorage.setItem("jwt", token);
        }
        await saveUserToFirestore(user, "github");
        localStorage.setItem("uid", user.uid);
        return user;
    } catch (error) {
        console.error("Error signing in with GitHub:", error);
        throw error;
    }
};

export const logOut = async (): Promise<void> => {
    try {
        await signOut(auth);
        localStorage.removeItem("jwt");
        localStorage.removeItem("uid");
        console.log("User signed out.");
    } catch (error) {
        console.error("Error signing out:", error);
    }
};

export const registerWithEmailAndPassword = async (email: string, password: string): Promise<User | null> => {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const user = result.user;
        await setDoc(doc(db, "users", user.uid), {
            email: user.email,
            uid: user.uid,
            role: "user",
            loginMethod: "register",
            password: hashedPassword,
            name: `User_${Math.floor(Math.random() * 1000)}`,
            avatar: "https://img.freepik.com/free-psd/3d-illustration-human-avatar-profile_23-2150671142.jpg?size=338&ext=jpg&ga=GA1.1.1141335507.1719446400&semt=ais_user"
        });
        console.log("User registered and saved to Firestore:", user);
        localStorage.setItem("uid", user.uid);
        return user;
    } catch (error) {
        console.error("Error registering new user:", error);
        throw error;
    }
};

export const signInWithEmailAndPassword = async (email: string, password: string): Promise<User | null> => {
    try {
        const result = await firebaseSignInWithEmailAndPassword(auth, email, password);
        const user = result.user;
        await saveUserToFirestore(user, "register");
        localStorage.setItem("uid", user.uid);
        return user;
    } catch (error) {
        console.error("Error signing in with email and password:", error);
        throw error;
    }
};
