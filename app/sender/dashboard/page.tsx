'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useError } from '@/components/ErrorHandler';
import Container from '@/components/ui/Container';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import NotificationBell from '@/components/NotificationBell';

// 샘플 서명 요청 데이터
const sampleRequests = [
  {
    id: 'REQ-001',
    title: '계약서 서명 요청',
    recipient: '홍길동',
    recipientEmail: 'hong@example.com',
    status: 'pending',
    createdAt: '2023-11-01T09:30:00',
    documentCount: 2
  },
  {
    id: 'REQ-002',
    title: '입사 서류 서명',
    recipient: '김철수',
    recipientEmail: 'kim@example.com',
    status: 'completed',
    createdAt: '2023-10-28T14:15:00',
    completedAt: '2023-10-29T10:22:00',
    documentCount: 3
  },
  {
    id: 'REQ-003',
    title: '개인정보 동의서',
    recipient: '이영희',
    recipientEmail: 'lee@example.com',
    status: 'viewed',
    createdAt: '2023-10-30T11:45:00',
    documentCount: 1
  },
  {
    id: 'REQ-004',
    title: '프로젝트 계약서',
    recipient: '박민수',
    recipientEmail: 'park@example.com',
    status: 'expired',
    createdAt: '2023-10-15T16:20:00',
    documentCount: 2
  }
];

// 상태별 색상 및 텍스트 정의
const statusConfig = {
  pending: { color: 'bg-yellow-100 text-yellow-800', text: '대기 중' },
  viewed: { color: 'bg-blue-100 text-blue-800', text: '열람됨' },
  completed: { color: 'bg-green-100 text-green-800', text: '완료됨' },
  expired: { color: 'bg-red-100 text-red-800', text: '만료됨' }
};

export default function SenderDashboard() {
  const router = useRouter();
  const { addError } = useError();
  const [isLoading, setIsLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    viewed: 0,
    expired: 0
  });
  
  useEffect(() => {
    // 실제로는 API에서 데이터를 가져옴
    const fetchData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 로딩 시뮬레이션
        
        // 로컬 스토리지와 세션 스토리지 모두에서 서명 요청 데이터 가져오기
        const savedSessionRequestsStr = sessionStorage.getItem('signature_requests');
        const savedLocalRequestsStr = localStorage.getItem('signature_requests');
        let allRequests = [...sampleRequests];
        
        // 모든 요청을 하나의 배열로 합치기
        const savedRequests = [];
        
        if (savedSessionRequestsStr) {
          const sessionRequests = JSON.parse(savedSessionRequestsStr);
          savedRequests.push(...sessionRequests);
        }
        
        if (savedLocalRequestsStr) {
          const localRequests = JSON.parse(savedLocalRequestsStr);
          savedRequests.push(...localRequests);
        }
        
        if (savedRequests.length > 0) {
          // 새 요청을 기존 샘플 데이터 앞에 추가
          allRequests = [...savedRequests, ...sampleRequests];
          
          // ID 기반 중복 제거 (같은 ID가 있는 경우 첫 번째 항목만 유지)
          const uniqueIds = new Set();
          allRequests = allRequests.filter(req => {
            if (uniqueIds.has(req.id)) {
              return false;
            }
            uniqueIds.add(req.id);
            return true;
          });
        }
        
        setRequests(allRequests);
        
        // 통계 계산
        const total = allRequests.length;
        const pending = allRequests.filter(req => req.status === 'pending').length;
        const completed = allRequests.filter(req => req.status === 'completed').length;
        const viewed = allRequests.filter(req => req.status === 'viewed').length;
        const expired = allRequests.filter(req => req.status === 'expired').length;
        
        setStats({ total, pending, completed, viewed, expired });
        setIsLoading(false);
      } catch (error) {
        addError('error', '데이터를 불러오는 중 오류가 발생했습니다.', true, 5000);
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [addError]);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const handleCreateRequest = () => {
    router.push('/sender/create-request');
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
        <Container maxWidth="xl">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </Container>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <Container maxWidth="xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">발송인 대시보드</h1>
            <p className="text-gray-600 mt-1">전자서명 요청을 관리하고 새로운 요청을 생성할 수 있습니다.</p>
          </div>
          <div className="flex items-center space-x-4">
            <NotificationBell userId="sender-001" />
            <Button
              onClick={handleCreateRequest}
              variant="primary"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              새 서명 요청
            </Button>
          </div>
        </div>
        
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 mr-4">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">전체 요청</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 mr-4">
                  <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">대기 중</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 mr-4">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">열람됨</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.viewed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 mr-4">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">완료됨</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-red-100 mr-4">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">만료됨</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.expired}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* 서명 요청 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>서명 요청 목록</CardTitle>
            <CardDescription>
              생성한 서명 요청의 상태를 확인하고 관리할 수 있습니다.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      요청 ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      제목
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      수신인
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      생성일
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      문서 수
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {request.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{request.recipient}</div>
                        <div className="text-xs text-gray-400">{request.recipientEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${statusConfig[request.status as keyof typeof statusConfig].color}`}>
                          {statusConfig[request.status as keyof typeof statusConfig].text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(request.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.documentCount}개
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link href={`/sender/request/${request.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                          상세보기
                        </Link>
                        {request.status === 'pending' && (
                          <button className="text-red-600 hover:text-red-900">
                            취소
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {requests.length === 0 && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">서명 요청이 없습니다</h3>
                <p className="mt-1 text-sm text-gray-500">새로운 서명 요청을 생성해보세요.</p>
                <div className="mt-6">
                  <Button
                    onClick={handleCreateRequest}
                    variant="primary"
                    size="sm"
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    }
                  >
                    새 서명 요청
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </Container>
    </div>
  );
} 