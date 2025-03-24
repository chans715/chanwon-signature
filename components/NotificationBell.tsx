'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface NotificationBellProps {
  userId?: string;
}

export default function NotificationBell({ userId }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    // 실제로는 API에서 읽지 않은 알림 개수를 가져옴
    const fetchUnreadCount = async () => {
      try {
        // 백엔드 연동 시 실제 API 호출로 대체
        await new Promise(resolve => setTimeout(resolve, 500)); // 로딩 시뮬레이션
        
        // 테스트용 랜덤 알림 개수 (0-5)
        const randomCount = Math.floor(Math.random() * 6);
        setUnreadCount(randomCount);
        
        // 세션 스토리지에 알림 개수 저장 (테스트용)
        sessionStorage.setItem('unreadNotifications', randomCount.toString());
        
        setIsLoading(false);
      } catch (error) {
        console.error('알림 개수를 가져오는 중 오류 발생:', error);
        setIsLoading(false);
      }
    };
    
    fetchUnreadCount();
    
    // 실시간 알림을 위한 웹소켓 연결 (실제 구현 시)
    // const socket = new WebSocket('ws://your-api-url/notifications');
    // socket.onmessage = (event) => {
    //   const data = JSON.parse(event.data);
    //   if (data.type === 'notification' && data.userId === userId) {
    //     setUnreadCount(prev => prev + 1);
    //   }
    // };
    
    // return () => {
    //   socket.close();
    // };
    
    // 테스트용 알림 시뮬레이션
    const simulateNewNotification = () => {
      const shouldAddNotification = Math.random() > 0.7; // 30% 확률로 새 알림 추가
      if (shouldAddNotification) {
        setUnreadCount(prev => prev + 1);
        sessionStorage.setItem('unreadNotifications', (unreadCount + 1).toString());
      }
    };
    
    const interval = setInterval(simulateNewNotification, 30000); // 30초마다 확인
    
    return () => {
      clearInterval(interval);
    };
  }, [userId, unreadCount]);
  
  const handleClick = () => {
    router.push('/sender/notifications');
  };
  
  return (
    <button 
      onClick={handleClick}
      className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
      aria-label="알림"
    >
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      
      {!isLoading && unreadCount > 0 && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
} 