// LiveTab.jsx - 라이브 CCTV 그리드 탭
import React, { useRef } from 'react';


function LiveTab({ videos, setVideos }) {
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  // 카메라 개수에 따라 가장 가까운 정사각형 그리드 열 개수 계산
  const gridCols = Math.ceil(Math.sqrt(videos.length));

  // 드래그 앤 드롭 순서 변경
  const handleSort = () => {
    let _videos = [...videos];
    const draggedItemContent = _videos.splice(dragItem.current, 1)[0];
    _videos.splice(dragOverItem.current, 0, draggedItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    setVideos(_videos);
  };

  return (
    <>
      <div className="sidebar">
        <h3>Camera List</h3>
        <div className="list-container">
          {videos.map((video, index) => (
            <div
              key={video.id}
              className="list-item"
              draggable
              onDragStart={() => (dragItem.current = index)}
              onDragEnter={() => (dragOverItem.current = index)}
              onDragEnd={handleSort}
              onDragOver={e => e.preventDefault()}
            >
              ☰ {video.title}
            </div>
          ))}
        </div>
      </div>
      <div className="main-content">
        <div
          className="video-grid"
          style={{ '--video-grid-cols': gridCols }}
        >
          {videos.map((video) => (
            <div key={video.id} className="video-card">
              <div className="video-wrapper">
                <video src={video.src} controls muted autoPlay loop />
              </div>
              <p>{video.title}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default LiveTab;
