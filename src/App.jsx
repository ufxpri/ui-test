// App.jsx - CCTV 그리드 및 드래그 앤 드롭 UI

import React, { useState } from 'react';
import './App.css';
import LiveTab from './tabs/LiveTab';
import CameraTab from './tabs/CameraTab';
import ProcessTab from './tabs/ProcessTab';
import AlertTab from './tabs/AlertTab';
import SearchTab from './tabs/SearchTab';

// 샘플 비디오 데이터 (초기값)
const initialVideos = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  title: `CCTV Feed #${i + 1}`,
  src: `http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`
}));


const TAB_LIST = [
  { key: 'live', label: '라이브' },
  { key: 'camera', label: '카메라 리스트 설정' },
  { key: 'process', label: '라이브 데이터 처리 프로세스 모니터링' },
  { key: 'alert', label: '실시간 알림 플로우 모니터링' },
  { key: 'search', label: '검색 페이지' },
];


function App() {
  // 탭 상태
  const [activeTab, setActiveTab] = useState('live');

  // 비디오 상태 (LiveTab만 사용)
  const [videos, setVideos] = useState(initialVideos);

  // 탭별 내용 렌더링
  const renderTabContent = () => {
    switch (activeTab) {
      case 'live':
        return <LiveTab videos={videos} setVideos={setVideos} />;
      case 'camera':
        return <CameraTab />;
      case 'process':
        return <ProcessTab />;
      case 'alert':
        return <AlertTab />;
      case 'search':
        return <SearchTab />;
      default:
        return null;
    }
  };

  return (
    <div className="app-vertical-container">
      {/* 상단 탭 바 */}
      <div className="tab-bar">
        {TAB_LIST.map(tab => (
          <button
            key={tab.key}
            className={activeTab === tab.key ? 'tab active' : 'tab'}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="app-container">
        {renderTabContent()}
      </div>
    </div>
  );
}

export default App;
