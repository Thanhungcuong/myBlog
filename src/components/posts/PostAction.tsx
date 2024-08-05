import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Button } from '@mui/material';
import { FaEllipsisH } from 'react-icons/fa';

interface PostActionProps {

    setIsEditModalOpen: (open: boolean) => void;
    setIsDeleteModalOpen: (open: boolean) => void;
}

const PostAction: React.FC<PostActionProps> = ({ setIsEditModalOpen, setIsDeleteModalOpen }) => {
    const [showOptions, setShowOptions] = useState<boolean>(false);
    const optionsRef = useRef<HTMLDivElement>(null);
    const dropdownOption = useRef<HTMLDivElement>(null);

    const toggleDropdown = useCallback((event: React.MouseEvent) => {
        event.stopPropagation();
        setShowOptions(!showOptions);
    }, [showOptions]);

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (
                dropdownOption.current &&
                !dropdownOption.current.contains(event.target as Node)
            ) {
                setShowOptions(false);
            }
        };

        if (showOptions) {
            document.addEventListener('mousedown', handleOutsideClick);
        } else {
            document.removeEventListener('mousedown', handleOutsideClick);
        }

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [showOptions]);


    return (
        <div
            onClick={toggleDropdown}
            ref={dropdownOption}
            className='cursor-pointer p-2 hover:bg-slate-300 rounded-full'
        >
            <FaEllipsisH />
            {showOptions && (
                <div ref={optionsRef} className='absolute top-20 right-4 z-50 bg-white shadow-lg rounded-lg p-2'>
                    <div>
                        <Button onClick={(e) => { e.stopPropagation(); setIsEditModalOpen(true); }}>Chỉnh sửa bài viết</Button>
                    </div>
                    <div>
                        <Button onClick={(e) => { e.stopPropagation(); setIsDeleteModalOpen(true); }}>Xóa bài viết</Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostAction;
