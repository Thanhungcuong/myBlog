import React, { useState } from 'react';
import { FaGoogle, FaFacebook, FaGithub } from 'react-icons/fa';
import { signInWithGoogle, signInWithFacebook, signInWithGithub, signInWithEmailAndPassword } from '../auth/authService';
import { Link, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import icon from '../img/icon.png';
import login from '../img/login.jpg'


const schema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const Login: React.FC = () => {
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
    });
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    const handleGoogleLogin = async () => {
        try {
            const user = await signInWithGoogle();
            if (user) {
                enqueueSnackbar('Login successful!', { variant: 'success' });
                navigate('/');
            }
        } catch (error) {
            console.error("Error during Google login:", error);
            enqueueSnackbar('Login failed. Please try again.', { variant: 'error' });
        }
    };

    const handleFacebookLogin = async () => {
        try {
            const user = await signInWithFacebook();
            if (user) {
                enqueueSnackbar('Login successful!', { variant: 'success' });
                navigate('/');
            }
        } catch (error) {
            console.error("Error during Facebook login:", error);
            enqueueSnackbar('Login failed. Please try again.', { variant: 'error' });
        }
    };

    const handleGithubLogin = async () => {
        try {
            const user = await signInWithGithub();
            if (user) {
                enqueueSnackbar('Login successful!', { variant: 'success' });
                navigate('/');
            }
        } catch (error) {
            console.error("Error during GitHub login:", error);
            enqueueSnackbar('Login failed. Please try again.', { variant: 'error' });
        }
    };

    const onSubmit = async (data: any) => {
        try {
            const user = await signInWithEmailAndPassword(data.email, data.password);
            if (user) {
                enqueueSnackbar('Login successful!', { variant: 'success' });
                navigate('/');
            }
        } catch (error) {
            console.error("Error logging in:", error);
            enqueueSnackbar('Login failed. Please try again.', { variant: 'error' });
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                
                    <img src={icon} alt="icon" className='w-2/3 mx-auto'/>
                    
                
                <h2 className="text-xl font-bold mb-6 text-center">Welcome <span className='font-bold text-2xl text-purple-600'>My BLog</span> ,LOGIN</h2>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                            Email
                        </label>
                        <input
                            
                            id="email"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            {...register('email')}
                        />
                        {errors.email && <p className="text-red-500 text-xs italic">{(errors.email as any).message}</p>}
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            {...register('password')}
                        />
                        {errors.password && <p className="text-red-500 text-xs italic">{(errors.password as any).message}</p>}
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            Submit
                        </button>
                        <Link
                            to="/register"
                            className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
                        >
                            Register
                        </Link>
                    </div>
                </form>
                <div className="mt-6">
                    <p className="text-center text-gray-600">Or login with</p>
                    <div className="flex flex-col gap-4 w-full justify-center mt-4">
                        <button
                            onClick={handleGoogleLogin}
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline gap-10 flex items-center"
                        >
                            <FaGoogle /> <span className='text-base'>Sign in with Google</span>
                        </button>
                        <button
                            onClick={handleFacebookLogin}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline gap-10 flex items-center"
                        >
                            <FaFacebook /> <span className='text-base'>Sign in with Facebook</span>
                        </button>
                        <button
                            onClick={handleGithubLogin}
                            className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline gap-10 flex items-center"
                        >
                            <FaGithub /> <span className='text-base'>Sign in with Github</span>
                        </button>
                    </div>
                </div>
            </div>
            <div>
                <img src={login} alt="login" className='h-[804px]'/>
            </div>
        </div>
    );
};

export default Login;
