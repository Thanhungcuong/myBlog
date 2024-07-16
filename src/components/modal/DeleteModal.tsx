import React from 'react'
import { Modal, Button } from '@mui/material'

interface DeleteModalProps {
    openModal: boolean;
    onClose: () => void;
    cancelButton: () => void;
    deteleButton: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
    openModal,
    onClose,
    cancelButton,
    deteleButton
}) => {
    return (
        <Modal
            open={openModal}
            onClose={onClose}
            className='flex items-center justify-center'
        >
            <div className='bg-white p-4 rounded-md shadow-md'>
                <h2 className='text-lg font-bold mb-4'>Xóa bài viết</h2>
                <p>Bạn có chắc chắn muốn xóa bài viết này không?</p>
                <div className='flex justify-end mt-4'>
                    <Button onClick={cancelButton} className='mr-2'>Hủy</Button>
                    <Button onClick={deteleButton} color="secondary">Xóa</Button>
                </div>
            </div>
        </Modal>
    );

}
export default DeleteModal