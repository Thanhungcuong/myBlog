import { Avatar } from '@mui/material';
import { FaCheck } from 'react-icons/fa';
import { Timestamp } from 'firebase/firestore';
interface PostInfoProps {
    avatar: string;
    name: string;
    currentPackage: string;
    id: string;
    handleClickPost: (id: string) => void;
    createdAt: Timestamp | Date;

}

const PostInfo: React.FC<PostInfoProps> = ({ avatar, name, currentPackage, id, handleClickPost, createdAt }) => {
    const renderName = () => {
        let nameStyle = "text-xl font-bold text-nowrap";
        let nameContent = <span>{name}</span>;

        switch (currentPackage) {
            case 'Gói VIP':
                nameStyle = "text-2xl max-sm:text-xl font-bold text-nowrap text-blue-700";
                nameContent = <span>{name} <FaCheck className="inline text-green-500" /></span>;
                break;
            case 'Gói tên':
                nameStyle = "text-2xl max-sm:text-xl font-bold text-nowrap text-blue-700";
                break;
            case 'Gói tick xanh':
                nameContent = <span>{name} <FaCheck className="inline text-green-500" /></span>;
                break;
            default:
                nameStyle = "text-2xl max-sm:text-xl font-bold text-nowrap";
                break;
        }

        return <h1 className={nameStyle}>{nameContent}</h1>;
    };
    return (
        <div className='flex items-center'>
            <Avatar src={avatar} alt="avatar" className='mr-4' />
            <div>
                {renderName()}
                <p onClick={() => handleClickPost(id)} className='text-gray-500 cursor-pointer'>{new Date(createdAt instanceof Timestamp ? createdAt.toDate() : createdAt).toLocaleString()}</p>
            </div>
        </div>
    )
}

export default PostInfo