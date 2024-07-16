import React from 'react';
import { Modal } from '@mui/material';
import { FaTimes, FaAngleLeft, FaAngleRight } from 'react-icons/fa';

interface ExpandedModalProps {
    isExpanded: boolean;
    onClose: () => void;
    imageUrls: string[];
    expandedImageIndex: number | null;
    setExpandedImageIndex: React.Dispatch<React.SetStateAction<number | null>>;
}

const ExpandedModal: React.FC<ExpandedModalProps> = ({
    isExpanded,
    onClose,
    imageUrls,
    expandedImageIndex,
    setExpandedImageIndex,
}) => {
    return (
        <Modal
            open={isExpanded}
            onClose={onClose}
            className="flex items-center justify-center"
        >
            <div className="relative w-2/3 h-3/4 flex items-center justify-center" tabIndex={0}>
                <div className="absolute cursor-pointer top-[5%] max-xl:top-1/3 right-[15%] text-xl text-slate-600 rounded-full p-2" onClick={onClose}>
                    <FaTimes />
                </div>
                {expandedImageIndex !== null && (
                    <img src={imageUrls[expandedImageIndex]} alt="detail_img" className="w-2/3" />
                )}
                <div className="absolute top-1/2 xl:left-[5%] max-sm:left-0 max-xl:left-0 cursor-pointer text-3xl w-32 h-full flex justify-center items-center transform max-sm:-translate-x-1/2 -translate-y-1/2" onClick={() => setExpandedImageIndex((prev) => (prev === 0 ? imageUrls.length - 1 : (prev || 0) - 1))}>
                    <FaAngleLeft />
                </div>
                <div className="absolute top-1/2 xl:right-[5%] max-sm: max-xl:right-0 cursor-pointer text-3xl w-32 h-full flex justify-center items-center transform max-sm:translate-x-1/2 -translate-y-1/2" onClick={() => setExpandedImageIndex((prev) => ((prev || 0) + 1) % imageUrls.length)}>
                    <FaAngleRight />
                </div>
            </div>
        </Modal>
    );
};

export default ExpandedModal;
