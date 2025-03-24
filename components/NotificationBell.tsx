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
  const [showMarkAllReadButton, setShowMarkAllReadButton] = useState(false);
  const router = useRouter();
  
  const markAllAsRead = () => {
    setUnreadCount(0);
    sessionStorage.setItem('unreadNotifications', '0');
    sessionStorage.setItem('notificationsLastReset', new Date().toISOString());
    setShowMarkAllReadButton(false);
  };
  
  useEffect(() => {
    // 실제로는 API에서 읽지 않은 알림 개수를 가져옴
    const fetchUnreadCount = async () => {
      try {
        // 백엔드 연동 시 실제 API 호출로 대체
        await new Promise(resolve => setTimeout(resolve, 500)); // 로딩 시뮬레이션
        
        // 항상 0으로 설정하여 알림 표시하지 않음
        setUnreadCount(0);
        
        // 세션 스토리지에 알림 개수 저장
        sessionStorage.setItem('unreadNotifications', '0');
        
        setIsLoading(false);
        
        // 알림이 있는 경우에만 "모두 읽음으로 표시" 버튼 표시
        setShowMarkAllReadButton(false);
      } catch (error) {
        console.error('알림 개수를 가져오는 중 오류 발생:', error);
        setIsLoading(false);
      }
    };
    
    fetchUnreadCount();
    
    // 알림 자동 생성 기능 제거 (일부러 알림이 생성되지 않도록)
    return () => {
      // 클린업 함수
    };
  }, [userId]);
  
  const handleClick = () => {
    if (unreadCount > 0) {
      // 알림이 있는 경우 알림 페이지로 이동
      router.push('/sender/notifications');
    } else {
      // 알림이 없는 경우 알림창 표시
      setShowMarkAllReadButton(!showMarkAllReadButton);
    }
  };
  
  return (
    <div className="relative">
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
      
      {showMarkAllReadButton && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
          <div className="py-1">
            <button 
              onClick={markAllAsRead}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              모두 읽음으로 표시
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 