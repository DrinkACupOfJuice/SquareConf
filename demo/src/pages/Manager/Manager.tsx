import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './manager.css';

// 评价数据接口（新增所用时间和token数字段）
interface Rating {
  id: string;
  score: number;
  comment: string;
  createdAt: string;
  usedTime: number; // 所用时间（秒，保留1位小数）
  tokenCount: number; // 调用token数
}

const Manager: React.FC = () => {
  const navigate = useNavigate();
  // 模拟历史评价数据（新增usedTime和tokenCount字段）
  const [ratings] = useState<Rating[]>([
    {
      id: '1',
      score: 85,
      comment: '功能很实用，操作也比较流畅，希望能增加更多自定义选项。',
      createdAt: '2025-10-28 14:30:00',
      usedTime: 1.2,
      tokenCount: 38
    },
    {
      id: '2',
      score: 92,
      comment: '体验非常好，响应速度快，界面简洁明了，值得推荐。',
      createdAt: '2025-10-27 09:15:00',
      usedTime: 0.8,
      tokenCount: 29
    },
    {
      id: '3',
      score: 70,
      comment: '整体还不错，但是偶尔会有卡顿，希望优化性能。',
      createdAt: '2025-10-26 16:45:00',
      usedTime: 1.5,
      tokenCount: 32
    }
  ]);

  // 计算平均得分
  const averageScore = ratings.reduce((sum, item) => sum + item.score, 0) / ratings.length;

  // 搜索状态
  const [searchValue, setSearchValue] = useState('');

  // 过滤评价（新增按所用时间、token数搜索）
  const filteredRatings = ratings.filter(rating => 
    rating.comment.includes(searchValue) || 
    rating.createdAt.includes(searchValue) || 
    rating.score.toString().includes(searchValue) ||
    rating.usedTime.toString().includes(searchValue) || // 按所用时间搜索
    rating.tokenCount.toString().includes(searchValue) // 按token数搜索
  );

  const goHome = () => {
    navigate('/Home');
  };

  return (
    <div className="container">
      <div className="manager-container">
        {/* 左侧导航栏 */}
        <aside className="sidebar">
          <button className="setting-btn" onClick={goHome}>
            首页
          </button>
          <button className="setting-btn">
            评价
          </button>
          <button className="setting-btn" onClick={() => navigate("/knowledge-base")}>
            知识库管理
          </button>
        </aside>

        {/* 右侧评价展示区域 */}
        <main className="main-area">
          {/* 右上角搜索 + 平均得分 */}
          <div className="top-bar">
            <div className="search-area">
              <input
                type="text"
                placeholder="搜索评价、时间、token数..." // 更新占位提示
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="average-score">
              平均得分：{averageScore.toFixed(1)} 分
            </div>
          </div>

          <h2 className="section-title">历史评价列表</h2>
          <div className="rating-list">
            {filteredRatings.map((rating) => (
              <div key={rating.id} className="rating-item">
                <div className="rating-header">
                  <span className="rating-score">{rating.score} 分</span>
                  <span className="rating-time">{rating.createdAt}</span>
                </div>
                {/* 新增所用时间和token数展示 */}
                <div className="rating-meta">
                  所用时间：{rating.usedTime.toFixed(1)}s • 调用token：{rating.tokenCount}
                </div>
                <div className="rating-comment">{rating.comment}</div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Manager;