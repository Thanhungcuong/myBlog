import React from 'react';
import { FaGoogle, FaFacebook, FaGithub, FaAsterisk } from 'react-icons/fa';
import { signInWithGoogle, signInWithFacebook, signInWithGithub, signInWithEmailAndPassword } from '../../auth/authService';
import { Link, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema } from '../../constant/schema/login'
import icon from '../../assets/img/icon.png';
import login from '../../assets/img/login.jpg';

const Login: React.FC = () => {
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(LoginSchema),
    });
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    const loginHandler = async (method: string, data?: any) => {
        try {
            let user;
            switch (method) {
                case 'google':
                    user = await signInWithGoogle();
                    break;
                case 'facebook':
                    user = await signInWithFacebook();
                    break;
                case 'github':
                    user = await signInWithGithub();
                    break;
                case 'email':
                    user = await signInWithEmailAndPassword(data.email, data.password);
                    break;
                default:
                    throw new Error('Unknown login method');
            }
            if (user) {
                enqueueSnackbar('Login successful!', {
                    variant: 'success',
                    anchorOrigin: { vertical: 'top', horizontal: 'right' },
                    autoHideDuration: 2000
                });
                navigate('/');
            }
        } catch (error) {
            console.error(`Error during ${method} login:`, error);
            enqueueSnackbar('Login failed. Please try again.', {
                variant: 'error',
                anchorOrigin: { vertical: 'top', horizontal: 'right' },
                autoHideDuration: 2000
            });
        }
    };

    const onSubmit = (data: any) => {
        loginHandler('email', data);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <img src={icon} alt="icon" className='w-2/3 mx-auto' />
                <h2 className="text-xl font-bold mb-6 text-center">Welcome to <span className='font-bold text-2xl text-purple-600'>MY BLOG</span></h2>
                <p className='text-xl font-bold mb-6 text-center'>Login</p>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                            Email <FaAsterisk className="inline w-3 text-red-500" />
                        </label>
                        <input
                            id="email"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            {...register('email', { required: true })}
                        />
                        {errors.email && <p className="text-red-500 text-xs italic">{(errors.email as any).message}</p>}
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            Password <FaAsterisk className="inline w-3 text-red-500" />
                        </label>
                        <input
                            type="password"
                            id="password"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            {...register('password', { required: true })}
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
                            className="inline-block align-baseline font-bold text-blue-500 hover:text-blue-800"
                        >
                            Register
                        </Link>
                    </div>
                </form>
                <div className="mt-6">
                    <p className="text-center text-gray-600">Or login with</p>
                    <div className="flex flex-col gap-4 w-full justify-center mt-4">
                        <button
                            onClick={() => loginHandler('google')}
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline gap-10 flex items-center"
                        >
                            <FaGoogle /> <span className='text-base'>Sign in with Google</span>
                        </button>
                        <button
                            onClick={() => loginHandler('facebook')}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline gap-10 flex items-center"
                        >
                            <FaFacebook /> <span className='text-base'>Sign in with Facebook</span>
                        </button>
                        <button
                            onClick={() => loginHandler('github')}
                            className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline gap-10 flex items-center"
                        >
                            <FaGithub /> <span className='text-base'>Sign in with Github</span>
                        </button>
                    </div>
                </div>
            </div>
            <div>
                <img src={login} alt="login" className='h-[804px]' />
            </div>
        </div>
    );
};

export default Login;
