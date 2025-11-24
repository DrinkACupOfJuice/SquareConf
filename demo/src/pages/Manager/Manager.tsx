import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import './Manager.css';

interface Rating {
  id: string;
  score: number;
  comment: string;
  createdAt: string;
  usedTime: number;
  tokenCount: number;
}

const Manager: React.FC = () => {
  const location = useLocation();
  const [ratings] = useState<Rating[]>([
    { id: '1', score: 85, comment: '功能很实用，操作流畅。', createdAt: '2025-10-28 14:30:00', usedTime: 1.2, tokenCount: 38 },
    { id: '2', score: 92, comment: '体验非常好，界面简洁。', createdAt: '2025-10-27 09:15:00', usedTime: 0.8, tokenCount: 29 },
    { id: '3', score: 70, comment: '整体不错，但偶尔卡顿。', createdAt: '2025-10-26 16:45:00', usedTime: 1.5, tokenCount: 32 },
    { id: '4', score: 60, comment: '功能较少，期待更多更新。', createdAt: '2025-10-25 11:20:00', usedTime: 2.0, tokenCount: 45 },
    { id: '5', score: 95, comment: '非常满意，推荐给朋友使用！', createdAt: '2025-10-24 13:10:00', usedTime: 0.5, tokenCount: 25 },
  ]);

  const [searchValue, setSearchValue] = useState('');
  const averageScore = ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length;
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const percent = Math.min(Math.max(averageScore / 100, 0), 1);
  const offset = circumference * (1 - percent);

  const filteredRatings = ratings.filter(rating =>
    rating.comment.toLowerCase().includes(searchValue.toLowerCase()) ||
    rating.createdAt.includes(searchValue) ||
    rating.score.toString().includes(searchValue) ||
    rating.usedTime.toString().includes(searchValue) ||
    rating.tokenCount.toString().includes(searchValue)
  );

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#4caf50';
    if (score >= 80) return '#8bc34a';
    if (score >= 70) return '#ffb74d';
    return '#f44336';
  };

  return (
    <div className="container">
      <Sidebar activeKey={location.pathname} />

      <main className="main-area">
        <div className="top-bar">
          <div className="search-area">
            <input
              type="text"
              placeholder="搜索评价、时间、token数..."
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="average-score-wrapper">
            <svg className="average-circle" width="50" height="50">
              <circle className="bg-circle" cx="25" cy="25" r={radius} />
              <circle
                className="progress-circle"
                cx="25"
                cy="25"
                r={radius}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{
                  ['--initOffset' as any]: circumference,
                  ['--targetOffset' as any]: offset,
                }}
              />
              <text x="25" y="30" textAnchor="middle" fontSize="12" fill="#333">
                {averageScore.toFixed(1)}
              </text>
            </svg>
            <div className="average-text">平均得分</div>
          </div>
        </div>

        <h2 className="section-title">历史评价列表</h2>
        <div className="rating-list">
          {filteredRatings.map((rating, index) => (
            <div
              key={rating.id}
              className="rating-item"
              style={{ '--i': index } as React.CSSProperties}
            >
              <div className="rating-header">
                <span className="rating-score" style={{ backgroundColor: getScoreColor(rating.score) }}>
                  {rating.score} 分
                </span>
                <span className="rating-time">{rating.createdAt}</span>
              </div>
              <div className="rating-meta">
                所用时间：{rating.usedTime.toFixed(1)}s • 调用token：{rating.tokenCount}
              </div>
              <div className="rating-comment">{rating.comment}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Manager;