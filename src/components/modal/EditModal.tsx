import React from 'react';
import { Modal, TextField, Button } from '@mui/material';
import { FaTimes, FaPlus } from 'react-icons/fa';

interface EditModalProps {
    isEditModalOpen: boolean;
    setIsEditModalOpen: (isOpen: boolean) => void;
    editedContent: string;
    setEditedContent: (content: string) => void;
    imageEdited: string[];
    handleRemoveImage: (index: number) => void;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleEditPost: () => void;
    handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
}

const EditModal: React.FC<EditModalProps> = ({
    isEditModalOpen,
    setIsEditModalOpen,
    editedContent,
    setEditedContent,
    imageEdited,
    handleRemoveImage,
    handleFileChange,
    handleEditPost,
    handleDrop,
}) => {
    return (
        <Modal
            open={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            className='flex items-center justify-center'
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
        >
            <div className='bg-white p-4 rounded-md shadow-md w-1/3 '>
                <div className='flex w-full justify-between '>
                    <h2 className='text-lg font-bold mb-4'>Chỉnh sửa bài viết</h2>
                    <FaTimes onClick={() => setIsEditModalOpen(false)} className='hover:bg-slate-300 cursor-pointer' />
                </div>
                <TextField
                    label="Nội dung"
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    fullWidth
                    variant="outlined"
                    multiline
                    rows={4}
                />
                <div className="grid grid-cols-3 gap-2 mt-2 border-2 border-dashed border-gray-300 p-4 cursor-pointer max-h-96 overflow-y-scroll">
                    {imageEdited.map((url, index) => (
                        <div key={index} className="relative">
                            <div>
                                <div className='absolute top-1 right-1 p-1 rounded-full bg-slate-300 hover:bg-slate-600'>
                                    <FaTimes className='text-white' onClick={() => handleRemoveImage(index)} />
                                </div>
                                <img src={url} alt='edit' className='w-full h-full ' />
                            </div>
                        </div>
                    ))}
                    <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="file-input"
                        multiple
                        type="file"
                        onChange={handleFileChange}

                    />
                    <label htmlFor="file-input" className=' h-[180px] flex items-center justify-center border border-dashed border-gray-300 cursor-pointer'>
                        <FaPlus />
                    </label>
                </div>
                <div className='flex justify-end mt-4'>
                    <Button onClick={() => setIsEditModalOpen(false)} className='mr-2'>Hủy</Button>
                    <Button onClick={handleEditPost} color="primary">Lưu</Button>
                </div>
            </div>
        </Modal>
    );
};

export default EditModal;
