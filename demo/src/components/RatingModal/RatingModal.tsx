import React, { useEffect, useState } from 'react';
import './ratingModal.css';

interface RatingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (score: number, comment: string) => void;
}

const RatingModal: React.FC<RatingModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [ratingScore, setRatingScore] = useState('');
    const [ratingComment, setRatingComment] = useState('');
    const [scoreError, setScoreError] = useState('');

    // 校验评分
    useEffect(() => {
        if (!ratingScore) {
            setScoreError('');
            return;
        }
        const num = Number(ratingScore);
        if (isNaN(num) || num < 1 || num > 100) {
            setScoreError('请输入1-100之间的数字');
        } else {
            setScoreError('');
        }
    }, [ratingScore]);

    const handleSubmit = () => {
        const num = Number(ratingScore);
        if (!ratingScore) {
            setScoreError('请输入评分');
            return;
        }
        if (isNaN(num) || num < 1 || num > 100) {
            setScoreError('请输入1-100之间的数字');
            return;
        }

        onSubmit(num, ratingComment);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="rm-modal">
            <div className="rm-modal-content">
                <button className="rm-close-btn" onClick={onClose}>×</button>
                <h3 className="rm-modal-title">请评价本次使用</h3>

                {/* 评分输入 */}
                <div className="rm-rating-input-group">
                    <label className="rm-rating-label">评分(1-100)：</label>
                    <input
                        type="text"
                        className={`rm-rating-input ${scoreError ? 'error' : ''}`}
                        placeholder="输入1-100的数字"
                        value={ratingScore}
                        onChange={(e) => setRatingScore(e.target.value.replace(/[^\d]/g, ''))}
                        onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                    />
                </div>
                {scoreError && <div className="rm-error-message">{scoreError}</div>}

                {/* 详细评价 */}
                <div className="rm-comment-input-group">
                    <label className="rm-comment-label">详细评价（可选）：</label>
                    <textarea
                        className="rm-comment-input"
                        placeholder="请输入您的详细评价(最多500字)"
                        value={ratingComment}
                        onChange={(e) => {
                            if (e.target.value.length <= 500) setRatingComment(e.target.value);
                            const target = e.target;
                            target.style.height = 'auto';
                            target.style.height = target.scrollHeight + 'px';
                        }}
                    />
                    <div className="rm-comment-count">{ratingComment.length}/500</div>
                </div>

                <div className="rm-modal-actions">
                    <button className="rm-cancel-btn" onClick={onClose}>取消</button>
                    <button className="rm-submit-btn" onClick={handleSubmit}>提交</button>
                </div>
            </div>
        </div>
    );
};

export default RatingModal;