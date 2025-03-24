'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useError } from '@/components/ErrorHandler';
import Container from '@/components/ui/Container';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

// 샘플 회원가입 요청 데이터
const sampleRegistrationRequests = [
  {
    id: 'REG-001',
    name: '홍길동',
    email: 'hong@example.com',
    company: '홍길동 주식회사',
    position: '대표이사',
    phone: '010-1234-5678',
    requestDate: '2023-11-01T09:30:00',
    status: 'pending'
  },
  {
    id: 'REG-002',
    name: '김철수',
    email: 'kim@example.com',
    company: '철수 엔터프라이즈',
    position: '이사',
    phone: '010-2345-6789',
    requestDate: '2023-10-30T14:15:00',
    status: 'pending'
  },
  {
    id: 'REG-003',
    name: '이영희',
    email: 'lee@example.com',
    company: '영희 컨설팅',
    position: '대표',
    phone: '010-3456-7890',
    requestDate: '2023-10-29T11:45:00',
    status: 'approved'
  },
  {
    id: 'REG-004',
    name: '박민수',
    email: 'park@example.com',
    company: '민수 테크',
    position: 'CTO',
    phone: '010-4567-8901',
    requestDate: '2023-10-28T16:20:00',
    status: 'rejected'
  }
];

// 샘플 사용자 통계 데이터
const sampleUserStats = {
  total: 15,
  active: 12,
  pending: 2,
  rejected: 1
};

// 상태별 색상 및 텍스트 정의
const statusConfig = {
  pending: { color: 'bg-yellow-100 text-yellow-800', text: '승인 대기' },
  approved: { color: 'bg-green-100 text-green-800', text: '승인됨' },
  rejected: { color: 'bg-red-100 text-red-800', text: '거절됨' }
};

export default function AdminDashboard() {
  const router = useRouter();
  const { addError } = useError();
  const [isLoading, setIsLoading] = useState(true);
  const [registrationRequests, setRegistrationRequests] = useState<any[]>([]);
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    rejected: 0
  });
  const [selectedTab, setSelectedTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  
  useEffect(() => {
    // 실제로는 API에서 데이터를 가져옴
    const fetchData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 로딩 시뮬레이션
        setRegistrationRequests(sampleRegistrationRequests);
        setUserStats(sampleUserStats);
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
  
  const handleApprove = async (id: string) => {
    try {
      // 실제로는 API 호출하여 승인 처리
      await new Promise(resolve => setTimeout(resolve, 500)); // 시뮬레이션
      
      // 상태 업데이트
      setRegistrationRequests(prev => 
        prev.map(req => 
          req.id === id ? { ...req, status: 'approved' } : req
        )
      );
      
      // 통계 업데이트
      setUserStats(prev => ({
        ...prev,
        active: prev.active + 1,
        pending: prev.pending - 1
      }));
      
      addError('success', '회원가입 요청이 승인되었습니다.', true, 3000);
    } catch (error) {
      addError('error', '승인 처리 중 오류가 발생했습니다.', true, 5000);
    }
  };
  
  const handleReject = async (id: string) => {
    try {
      // 실제로는 API 호출하여 거절 처리
      await new Promise(resolve => setTimeout(resolve, 500)); // 시뮬레이션
      
      // 상태 업데이트
      setRegistrationRequests(prev => 
        prev.map(req => 
          req.id === id ? { ...req, status: 'rejected' } : req
        )
      );
      
      // 통계 업데이트
      setUserStats(prev => ({
        ...prev,
        rejected: prev.rejected + 1,
        pending: prev.pending - 1
      }));
      
      addError('success', '회원가입 요청이 거절되었습니다.', true, 3000);
    } catch (error) {
      addError('error', '거절 처리 중 오류가 발생했습니다.', true, 5000);
    }
  };
  
  const filteredRequests = selectedTab === 'all' 
    ? registrationRequests 
    : registrationRequests.filter(req => req.status === selectedTab);
  
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
            <h1 className="text-2xl font-bold text-gray-900">관리자 대시보드</h1>
            <p className="text-gray-600 mt-1">회원가입 요청을 관리하고 시스템 상태를 모니터링할 수 있습니다.</p>
          </div>
        </div>
        
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 mr-4">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">전체 사용자</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.total}</p>
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
                  <p className="text-sm font-medium text-gray-600">활성 사용자</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.active}</p>
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
                  <p className="text-sm font-medium text-gray-600">승인 대기</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-red-100 mr-4">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">거절됨</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats.rejected}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* 회원가입 요청 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>회원가입 요청</CardTitle>
            <CardDescription>
              발송인 회원가입 요청을 검토하고 승인 또는 거절할 수 있습니다.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {/* 탭 */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setSelectedTab('all')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    selectedTab === 'all'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  전체
                </button>
                <button
                  onClick={() => setSelectedTab('pending')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    selectedTab === 'pending'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  승인 대기
                </button>
                <button
                  onClick={() => setSelectedTab('approved')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    selectedTab === 'approved'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  승인됨
                </button>
                <button
                  onClick={() => setSelectedTab('rejected')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    selectedTab === 'rejected'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  거절됨
                </button>
              </nav>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      이름
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      회사
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      이메일
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      요청일
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {request.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.company}
                        {request.position && <div className="text-xs text-gray-400">{request.position}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{request.email}</div>
                        <div className="text-xs text-gray-400">{request.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(request.requestDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${statusConfig[request.status as keyof typeof statusConfig].color}`}>
                          {statusConfig[request.status as keyof typeof statusConfig].text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {request.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleApprove(request.id)}
                              className="text-green-600 hover:text-green-900 mr-4"
                            >
                              승인
                            </button>
                            <button 
                              onClick={() => handleReject(request.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              거절
                            </button>
                          </>
                        )}
                        {request.status === 'approved' && (
                          <button 
                            onClick={() => handleReject(request.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            승인 취소
                          </button>
                        )}
                        {request.status === 'rejected' && (
                          <button 
                            onClick={() => handleApprove(request.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            승인으로 변경
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredRequests.length === 0 && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">요청이 없습니다</h3>
                <p className="mt-1 text-sm text-gray-500">선택한 상태의 회원가입 요청이 없습니다.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </Container>
    </div>
  );
} 