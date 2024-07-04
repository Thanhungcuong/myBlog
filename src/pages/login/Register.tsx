import React, { useState } from 'react';
import { registerWithEmailAndPassword } from '../../auth/authService';
import { useNavigate } from 'react-router-dom';
import { AiFillEye, AiFillEyeInvisible, AiOutlineArrowLeft } from 'react-icons/ai';
import { FaAsterisk } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSnackbar } from 'notistack';
import icon from '../../assets/img/icon.png';
import registerImage from '../../assets/img/register.jpg';


const schema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters" })
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

const Register: React.FC = () => {
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    const onSubmit = async (data: any) => {
        try {
            await registerWithEmailAndPassword(data.email, data.password);
            enqueueSnackbar('Registration successful!', {
                variant: 'success', anchorOrigin: { vertical: 'top', horizontal: 'right' },
                autoHideDuration: 2000
            });
            navigate('/login');
        } catch (error) {
            console.error("Error registering:", error);
            enqueueSnackbar('Registration failed. Please try again.', {
                variant: 'error', anchorOrigin: { vertical: 'top', horizontal: 'right' },
                autoHideDuration: 2000
            });
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <img src={icon} alt="icon" className='w-2/3 mx-auto' />
                <h2 className="text-xl font-bold mb-6 text-center">Welcome <span className='font-bold text-2xl text-purple-600'>My Blog</span>, Register</h2>
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
                    <div className="mb-6 relative">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            Password <FaAsterisk className="inline w-3 text-red-500" />
                        </label>
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            {...register('password', { required: true })}
                        />
                        {errors.password && <p className="text-red-500 text-xs italic">{(errors.password as any).message}</p>}
                        <div className="absolute top-[60%] right-0 pr-3 flex items-center text-sm leading-5">
                            <button type="button" onClick={togglePasswordVisibility}>
                                {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                            </button>
                        </div>
                    </div>
                    <div className="mb-6 relative">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                            Confirm Password <FaAsterisk className="inline w-3 text-red-500" />
                        </label>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            id="confirmPassword"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            {...register('confirmPassword', { required: true })}
                        />
                        {errors.confirmPassword && <p className="text-red-500 text-xs italic">{(errors.confirmPassword as any).message}</p>}
                        <div className="absolute top-[60%] right-0 pr-3 flex items-center text-sm leading-5">
                            <button type="button" onClick={toggleConfirmPasswordVisibility}>
                                {showConfirmPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            Register
                        </button>
                        <button
                            type="button"
                            className="flex items-center text-blue-500 hover:text-blue-700 font-bold py-2 px-4 focus:outline-none focus:shadow-outline"
                            onClick={() => navigate('/login')}
                        >
                            <AiOutlineArrowLeft className="mr-2" />
                            Back to Login
                        </button>
                    </div>
                </form>
            </div>
            <div>
                <img src={registerImage} alt="register" className='h-[678px]' />
            </div>
        </div>
    );
};

export default Register;
