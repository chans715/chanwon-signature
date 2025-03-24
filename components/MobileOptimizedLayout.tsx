'use client';

import React, { useEffect, useState } from 'react';

interface MobileOptimizedLayoutProps {
  children: React.ReactNode;
}

export default function MobileOptimizedLayout({ children }: MobileOptimizedLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  // 모바일 기기 감지
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|windows phone/i;
      setIsMobile(mobileRegex.test(userAgent));
    };

    // 화면 방향 감지
    const checkOrientation = () => {
      if (window.matchMedia("(orientation: portrait)").matches) {
        setOrientation('portrait');
      } else {
        setOrientation('landscape');
      }
    };

    checkMobile();
    checkOrientation();

    // 화면 크기 변경 이벤트 리스너
    const handleResize = () => {
      checkOrientation();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // 모바일 가로 모드 경고
  if (isMobile && orientation === 'landscape') {
    return (
      <div className="fixed inset-0 bg-blue-600 text-white flex flex-col items-center justify-center p-6 z-50">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        <h2 className="text-xl font-bold mb-2">세로 모드로 전환해주세요</h2>
        <p className="text-center">
          전자서명 서비스는 세로 모드에서 최적화되어 있습니다.
          더 나은 사용자 경험을 위해 기기를 세로로 돌려주세요.
        </p>
      </div>
    );
  }

  // 모바일 최적화 스타일 적용
  return (
    <div className={`${isMobile ? 'mobile-optimized' : ''}`}>
      {/* 모바일 기기에서 확대/축소 방지 메타 태그 */}
      {isMobile && (
        <style jsx global>{`
          .mobile-optimized {
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
          }
          
          .mobile-optimized input, 
          .mobile-optimized button {
            font-size: 16px; /* iOS에서 자동 확대 방지 */
          }
          
          @media (max-width: 640px) {
            .mobile-optimized {
              font-size: 16px;
            }
          }
        `}</style>
      )}
      {children}
    </div>
  );
} 