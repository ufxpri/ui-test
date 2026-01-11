// App.jsx - CCTV 그리드 및 드래그 앤 드롭 UI

import React, { useState, useEffect } from 'react';
import './App.css';
import LiveTab from './tabs/LiveTab';
import CameraTab from './tabs/CameraTab';
import ProcessTab from './tabs/ProcessTab';
import AlertTab from './tabs/AlertTab';
import SearchTab from './tabs/SearchTab';

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

  // 비디오 상태 (LiveTab만 사용) - now loaded from database
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load cameras from database on mount
  useEffect(() => {
    loadCameras();
  }, []);

  const loadCameras = async () => {
    try {
      setLoading(true);
      const result = await window.api.cameras.getAll();
      if (result.success) {
        setVideos(result.data);
      } else {
        console.error('Failed to load cameras:', result.error);
      }
    } catch (error) {
      console.error('Error loading cameras:', error);
    } finally {
      setLoading(false);
    }
  };

  // 탭별 내용 렌더링
  const renderTabContent = () => {
    if (loading) {
      return <div style={{ padding: '20px', textAlign: 'center' }}>Loading cameras...</div>;
    }

    switch (activeTab) {
      case 'live':
        return <LiveTab videos={videos} setVideos={setVideos} reloadCameras={loadCameras} />;
      case 'camera':
        return <CameraTab cameras={videos} reloadCameras={loadCameras} />;
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
