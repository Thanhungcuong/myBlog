import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import { FormData } from '../../constant/type/FormData';
import { FaCheckCircle } from "react-icons/fa";


interface Props {
    open: boolean;
    onClose: () => void;
    values: FormData;
    handleSubmit: () => void;
}

const ModalPreview: React.FC<Props> = ({ open, onClose, values, handleSubmit }) => {

    const renderName = () => {
        let nameStyle = "text-xl font-bold text-nowrap";
        let nameContent = <span>Nguyen Van A</span>;

        switch (values.package) {
            case 'Gói VIP':
                nameStyle = "text-2xl flex max-sm:text-base font-bold text-nowrap text-blue-700";
                nameContent = <span>Nguyen Van A <FaCheckCircle className="inline mb-1 text-blue-500" /></span>;
                break;
            case 'Gói tên':
                nameStyle = "text-2xl flex max-sm:text-base font-bold text-nowrap text-blue-700";
                break;
            case 'Gói tick xanh':
                nameContent = <span>Nguyen Van A <FaCheckCircle className="inline mb-1 text-blue-500" /></span>;
                break;
            default:
                nameStyle = "text-2xl flex max-sm:text-base font-bold text-nowrap";
                break;
        }

        return <h1 className={nameStyle}>{nameContent}</h1>;
    };


    return (
        <div>


            <Dialog className='' open={open} onClose={onClose} maxWidth="sm" fullWidth>
                <p className='m-5 font-bold text-2xl '>Preview thông tin đăng ký</p>
                <DialogContent className='flex flex-col divide-y-2'>
                    <div className='border-t-2 pt-5'>

                        <p className='text-xl font-bold'>Bước I, Thông tin cá nhân</p>
                        <div className='my-5 ml-10'>
                            <p className='text-lg font-semibold'>a, Tên: <span className='font-normal'>{values.name}</span> </p>
                            <p className='text-lg font-semibold'>b, Email: <span className='font-normal'>{values.email}</span></p>
                            <p className='text-lg font-semibold'>c, Phone: <span className='font-normal'>{values.phone}</span></p>
                        </div>
                    </div>

                    <div className='pt-5'>

                        <p className='text-xl font-bold'>Bước II, Ảnh cá nhân và CCCD</p>
                        <div className='flex flex-col my-5 ml-10'>

                            <p className='text-lg font-semibold'>a, Ảnh cá nhân: {values.personalPhoto ? <img src={URL.createObjectURL(values.personalPhoto)} alt="Personal" className='size-64 my-2 mx-auto' /> : 'N/A'}</p>
                            <p className='text-lg font-semibold'>b, Ảnh CCCD mặt trước: {values.cccdPhotoFront ? <img src={URL.createObjectURL(values.cccdPhotoFront)} alt="CCCD Front" className='size-64 my-2 mx-auto' /> : 'N/A'}</p>
                            <p className='text-lg font-semibold'>c, Ảnh CCCD mặt sau: {values.cccdPhotoBack ? <img src={URL.createObjectURL(values.cccdPhotoBack)} alt="CCCD Back" className='size-64 my-2 mx-auto' /> : 'N/A'}</p>
                        </div>
                    </div>

                    <div className='pt-5'>

                        <p className='text-xl font-bold'>Bước III, Gói đăng ký:</p>
                        <p className='text-lg ml-10 my-2 font-semibold '>{values.package}</p>
                    </div>
                    <div className='pt-5'>

                        <p className='text-xl font-bold'>Bước IV, Ảnh giao dịch</p>
                        <p className='font-bold ml-10'>{values.transactionImage ? <img src={URL.createObjectURL(values.transactionImage)} alt="Transaction" className='size-64 my-5 mx-auto' /> : 'N/A'}</p>
                    </div>

                    <div className='pt-5'>
                        <p className='text-xl font-bold mb-2'>Xem trước quyền lợi</p>
                        <p className='text-lg'>Khi bạn đăng ký gói <span className='font-bold text-xl text-purple-400'>{values.package}</span> của chúng tôi, trang cá nhân và bài viết của bạn sẽ nổi bật trong ứng dụng.
                        </p>
                        <p className='text-lg'>Chúc bạn có trải nghiệm tốt với <span className='text-xl font-bold text-blue-400'>My-blog</span>!</p>

                        <div className='flex flex-col justify-around mt-10'>
                            <div className=''>
                                <p className='ml-5 font-bold text-xl mb-2'>Bài viết của bạn</p>
                                <div className="flex flex-col justify-center items-center mb-6 w-4/5 mx-auto">
                                    <div className="w-full bg-white h-1/2 p-4 rounded-md shadow-md">
                                        <div className="flex items-center space-x-4 mb-4">
                                            <div className="bg-gray-300 animate-pulse size-20 max-sm:size-14 rounded-full"></div>
                                            <div className="flex-1 space-y-2">
                                                <div className="">{renderName()}</div>
                                                <div className="bg-gray-300 animate-pulse h-4 w-3/4 rounded"></div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="bg-gray-300 animate-pulse h-4 w-full rounded"></div>
                                            <div className="bg-gray-300 animate-pulse h-4 w-5/6 rounded"></div>
                                        </div>
                                        <div className="grid grid-cols-3 mx-auto gap-2 mt-4 ">
                                            {[...Array(3)].map((_, index) => (
                                                <div key={index} className="bg-gray-300  animate-pulse h-[100px] w-[120px] max-sm:w-[60px] rounded-md"></div>
                                            ))}
                                        </div>

                                    </div>
                                </div>
                            </div>

                            <div className='pt-5'>
                                <p className='ml-5 font-bold text-xl'>Trang cá nhân của bạn</p>
                                <div className="flex flex-col items-center mt-5 bg-[#fefefe]">
                                    <div className="flex flex-col items-center mb-20 relative w-4/5">
                                        <div className="w-full h-48 overflow-hidden">
                                            <div className="h-48 bg-gray-200 animate-pulse"></div>
                                        </div>
                                        <div className="flex justify-between w-full">
                                            <div className="absolute bottom-0 left-[50%] max-sm:left-1/2 max-sm:top-[105%] transform -translate-x-1/2 flex gap-5 translate-y-[75%] z-50">
                                                <div className="size-40 max-sm:size-20 bg-gray-300 border-4 border-white rounded-full animate-pulse"></div>
                                                <div className="my-auto space-y-2">
                                                    <div>{renderName()}</div>
                                                    <div className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
                                                    <div className="h-4 bg-gray-300 rounded w-20 animate-pulse"></div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>

                                </div>
                            </div>

                        </div>
                    </div>
                </DialogContent>

                <DialogActions className='flex justify-between'>
                    <div>

                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            color="primary"
                        >
                            Submit
                        </Button>
                    </div>
                    <div>

                        <Button onClick={onClose} color="primary">Close</Button>
                    </div>
                </DialogActions>
            </Dialog>


        </div>
    );
};

export default ModalPreview;
