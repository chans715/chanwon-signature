'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useError } from '@/components/ErrorHandler';
import Container from '@/components/ui/Container';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

// 알림 타입 정의
type NotificationType = 'signature_completed' | 'document_viewed' | 'request_expired' | 'system';

// 알림 인터페이스
interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  documentId?: string;
  requestId?: string;
  recipientName?: string;
  createdAt: string;
  isRead: boolean;
}

// 알림 타입별 아이콘 및 색상
const notificationConfig = {
  signature_completed: {
    icon: (
      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  document_viewed: {
    icon: (
      <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  request_expired: {
    icon: (
      <svg className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200'
  },
  system: {
    icon: (
      <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200'
  }
};

// 샘플 알림 데이터
const sampleNotifications: Notification[] = [
  {
    id: 'notif-001',
    type: 'signature_completed',
    title: '서명 완료',
    message: '홍길동님이 "계약서" 문서에 서명을 완료했습니다.',
    documentId: 'doc-001',
    requestId: 'req-001',
    recipientName: '홍길동',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30분 전
    isRead: false
  },
  {
    id: 'notif-002',
    type: 'document_viewed',
    title: '문서 확인',
    message: '김철수님이 "업무 협약서" 문서를 확인했습니다.',
    documentId: 'doc-002',
    requestId: 'req-002',
    recipientName: '김철수',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2시간 전
    isRead: false
  },
  {
    id: 'notif-003',
    type: 'request_expired',
    title: '요청 만료',
    message: '"판매 계약서" 서명 요청이 만료되었습니다.',
    documentId: 'doc-003',
    requestId: 'req-003',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1일 전
    isRead: true
  },
  {
    id: 'notif-004',
    type: 'system',
    title: '시스템 알림',
    message: '시스템 점검이 예정되어 있습니다. 2023년 12월 15일 오전 2시부터 4시까지 서비스 이용이 제한될 수 있습니다.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2일 전
    isRead: true
  },
  {
    id: 'notif-005',
    type: 'signature_completed',
    title: '서명 완료',
    message: '이영희님이 "임대차 계약서" 문서에 서명을 완료했습니다.',
    documentId: 'doc-004',
    requestId: 'req-004',
    recipientName: '이영희',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3일 전
    isRead: true
  }
];

export default function Notifications() {
  const router = useRouter();
  const { addError } = useError();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  
  useEffect(() => {
    // 실제로는 API에서 알림 데이터를 가져옴
    const fetchNotifications = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 로딩 시뮬레이션
        setNotifications(sampleNotifications);
        setIsLoading(false);
        
        // 읽지 않은 알림 개수 업데이트 (테스트용)
        const unreadCount = sampleNotifications.filter(n => !n.isRead).length;
        sessionStorage.setItem('unreadNotifications', unreadCount.toString());
      } catch (error) {
        addError('error', '알림을 불러오는 중 오류가 발생했습니다.', true, 5000);
        setIsLoading(false);
      }
    };
    
    fetchNotifications();
  }, [addError]);
  
  const handleMarkAsRead = async (id: string) => {
    try {
      // 실제로는 API 호출하여 읽음 처리
      await new Promise(resolve => setTimeout(resolve, 300)); // 시뮬레이션
      
      // 상태 업데이트
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, isRead: true } : notif
        )
      );
      
      // 읽지 않은 알림 개수 업데이트 (테스트용)
      const updatedUnreadCount = notifications.filter(n => !n.isRead && n.id !== id).length;
      sessionStorage.setItem('unreadNotifications', updatedUnreadCount.toString());
      
      addError('success', '알림을 읽음으로 표시했습니다.', true, 2000);
    } catch (error) {
      addError('error', '알림 상태 변경 중 오류가 발생했습니다.', true, 5000);
    }
  };
  
  const handleMarkAllAsRead = async () => {
    try {
      // 실제로는 API 호출하여 모두 읽음 처리
      await new Promise(resolve => setTimeout(resolve, 500)); // 시뮬레이션
      
      // 상태 업데이트
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      
      // 읽지 않은 알림 개수 업데이트 (테스트용)
      sessionStorage.setItem('unreadNotifications', '0');
      
      addError('success', '모든 알림을 읽음으로 표시했습니다.', true, 2000);
    } catch (error) {
      addError('error', '알림 상태 변경 중 오류가 발생했습니다.', true, 5000);
    }
  };
  
  const handleViewDocument = (documentId: string, requestId: string) => {
    // 실제로는 문서 상세 페이지로 이동
    router.push(`/sender/documents/${documentId}?requestId=${requestId}`);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) {
      return '방금 전';
    } else if (diffMin < 60) {
      return `${diffMin}분 전`;
    } else if (diffHour < 24) {
      return `${diffHour}시간 전`;
    } else if (diffDay < 7) {
      return `${diffDay}일 전`;
    } else {
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };
  
  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(notif => !notif.isRead);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
        <Container maxWidth="lg">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </Container>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <Container maxWidth="lg">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">알림</h1>
            <p className="text-gray-600 mt-1">서명 요청 및 시스템 알림을 확인할 수 있습니다.</p>
          </div>
          <div className="flex space-x-4">
            <div className="flex rounded-md shadow-sm">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } border border-gray-300`}
              >
                전체
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                  filter === 'unread'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } border border-gray-300 border-l-0`}
              >
                읽지 않음
              </button>
            </div>
            <Button
              variant="outline"
              onClick={handleMarkAllAsRead}
              disabled={!notifications.some(n => !n.isRead)}
            >
              모두 읽음으로 표시
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>알림 목록</CardTitle>
            <CardDescription>
              최근 알림이 먼저 표시됩니다.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-4 border rounded-lg flex items-start ${
                      notification.isRead 
                        ? 'bg-white border-gray-200' 
                        : `${notificationConfig[notification.type].bgColor} ${notificationConfig[notification.type].borderColor}`
                    }`}
                  >
                    <div className="flex-shrink-0 mr-4">
                      {notificationConfig[notification.type].icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                        <span className="text-xs text-gray-500">{formatDate(notification.createdAt)}</span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                      {(notification.documentId && notification.requestId) && (
                        <div className="mt-2">
                          <button
                            onClick={() => handleViewDocument(notification.documentId!, notification.requestId!)}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            문서 보기
                          </button>
                        </div>
                      )}
                    </div>
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="ml-4 text-sm text-gray-500 hover:text-gray-700"
                      >
                        읽음으로 표시
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">알림이 없습니다</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {filter === 'all' 
                      ? '아직 알림이 없습니다.' 
                      : '읽지 않은 알림이 없습니다.'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
} 