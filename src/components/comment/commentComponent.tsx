import React from 'react';
import { Avatar, Button, TextField, IconButton, InputAdornment } from '@mui/material';
import { FaRegPaperPlane } from 'react-icons/fa';
import { Timestamp } from 'firebase/firestore';

interface Comment {
    uid: string;
    name: string;
    avatar: string;
    content: string;
    createdAt: Date | Timestamp;
}

interface CommentComponentProps {
    comments: Comment[];
    visibleCommentCount: number;
    visibleComments: { [key: number]: boolean };
    newComment: string;
    truncateText: (text: string, length: number) => string;
    handleToggleVisibility: (index: number) => void;
    loadMoreComments: () => void;
    handleCommentSubmit: () => void;
    setNewComment: React.Dispatch<React.SetStateAction<string>>;
}

const CommentComponent: React.FC<CommentComponentProps> = ({
    comments,
    visibleCommentCount,
    visibleComments,
    newComment,
    truncateText,
    handleToggleVisibility,
    loadMoreComments,
    handleCommentSubmit,
    setNewComment,
}) => {
    return (
        <div className="comments-section container">
            {comments.slice(0, visibleCommentCount).map((comment, index) => (
                <div key={index}>
                    <div className="comment bg-slate-200 p-4 rounded-lg mb-4">
                        <div className="avatar flex items-center gap-2">
                            <Avatar src={comment.avatar} />
                            <div>
                                <div className="comment-author text-lg font-bold">{comment.name}</div>
                                <p className='text-gray-500'>
                                    {comment.createdAt instanceof Timestamp ? comment.createdAt.toDate().toLocaleString() : new Date(comment.createdAt).toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <div className="comment-content">
                            <div className="comment-text text-wrap break-words max-lg:max-w-[300px] max-sm:max-w-[200px]">
                                {truncateText(comment.content, visibleComments[index] ? comment.content.length : 40)}
                                {comment.content.length > 40 && !visibleComments[index] && (
                                    <Button
                                        className="view-more-button"
                                        onClick={() => handleToggleVisibility(index)}
                                    >
                                        More
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
            {comments.length > visibleCommentCount && (
                <Button onClick={loadMoreComments}>Watch more comment</Button>
            )}
            <div className="add-comment">
                <TextField
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment"
                    variant="outlined"
                    fullWidth
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={handleCommentSubmit}>
                                    <FaRegPaperPlane />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
            </div>
        </div>
    );
};

export default CommentComponent;
