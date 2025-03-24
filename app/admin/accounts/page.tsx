'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useError } from '@/components/ErrorHandler';
import Container from '@/components/ui/Container';
import Card, { CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

// 샘플 관리자 계정 데이터
const sampleAdminAccounts = [
  {
    id: 'ADM-001',
    name: '김관리',
    email: 'admin@example.com',
    role: 'super-admin',
    lastLogin: '2023-11-01T09:30:00',
    status: 'active',
    createdAt: '2023-01-15T10:00:00'
  },
  {
    id: 'ADM-002',
    name: '이승인',
    email: 'approval@example.com',
    role: 'approval-admin',
    lastLogin: '2023-10-30T14:15:00',
    status: 'active',
    createdAt: '2023-03-20T11:30:00'
  },
  {
    id: 'ADM-003',
    name: '박지원',
    email: 'support@example.com',
    role: 'support-admin',
    lastLogin: '2023-10-29T11:45:00',
    status: 'active',
    createdAt: '2023-05-10T09:15:00'
  },
  {
    id: 'ADM-004',
    name: '최모니터',
    email: 'monitor@example.com',
    role: 'read-only',
    lastLogin: '2023-10-28T16:20:00',
    status: 'inactive',
    createdAt: '2023-06-05T14:45:00'
  }
];

// 샘플 발송자 데이터 (실제로는 API에서 가져와야 함)
const sampleSenderData = [
  { id: 'S001', name: '김철수', email: 'kim@example.com', totalRequests: 15, active: true },
  { id: 'S002', name: '이영희', email: 'lee@example.com', totalRequests: 8, active: true },
  { id: 'S003', name: '박지민', email: 'park@example.com', totalRequests: 22, active: true },
  { id: 'S004', name: '정민수', email: 'jung@example.com', totalRequests: 5, active: false },
  { id: 'S005', name: '최수진', email: 'choi@example.com', totalRequests: 12, active: true },
  { id: 'S006', name: '강준호', email: 'kang@example.com', totalRequests: 3, active: true },
];

// 역할별 설명 및 권한
const roleConfig = {
  'super-admin': { 
    label: '최고 관리자', 
    description: '모든 기능에 접근 가능, 관리자 계정 생성 권한 보유',
    color: 'bg-purple-100 text-purple-800'
  },
  'approval-admin': { 
    label: '승인 관리자', 
    description: '회원가입 승인 및 관리 권한 보유',
    color: 'bg-blue-100 text-blue-800'
  },
  'support-admin': { 
    label: '지원 관리자', 
    description: '사용자 지원 및 문의 관리 권한 보유',
    color: 'bg-green-100 text-green-800'
  },
  'read-only': { 
    label: '읽기 전용', 
    description: '시스템 모니터링 및 통계 확인만 가능',
    color: 'bg-gray-100 text-gray-800'
  }
};

// 상태별 색상 및 텍스트 정의
const statusConfig = {
  active: { color: 'bg-green-100 text-green-800', text: '활성' },
  inactive: { color: 'bg-red-100 text-red-800', text: '비활성' }
};

interface SenderStats {
  totalSenders: number;
  totalRequests: number;
  averageRequestsPerSender: number;
  senderRequestCounts: Record<string, number>;
}

export default function AdminAccounts() {
  const router = useRouter();
  const { addError } = useError();
  const [isLoading, setIsLoading] = useState(true);
  const [adminAccounts, setAdminAccounts] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAdminData, setNewAdminData] = useState({
    name: '',
    email: '',
    role: 'support-admin',
    password: '',
    confirmPassword: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState<SenderStats>({
    totalSenders: 0,
    totalRequests: 0,
    averageRequestsPerSender: 0,
    senderRequestCounts: {}
  });
  
  useEffect(() => {
    // 실제로는 API에서 데이터를 가져옴
    const fetchData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 로딩 시뮬레이션
        setAdminAccounts(sampleAdminAccounts);
        setIsLoading(false);
      } catch (error) {
        addError('error', '데이터를 불러오는 중 오류가 발생했습니다.', true, 5000);
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [addError]);
  
  useEffect(() => {
    // 통계 계산
    const senderRequestCounts: Record<string, number> = {};
    let totalRequests = 0;

    sampleSenderData.forEach(sender => {
      senderRequestCounts[sender.name] = sender.totalRequests;
      totalRequests += sender.totalRequests;
    });

    setStats({
      totalSenders: sampleSenderData.length,
      totalRequests: totalRequests,
      averageRequestsPerSender: totalRequests / sampleSenderData.length,
      senderRequestCounts
    });
  }, []);
  
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
  
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 입력 검증
    if (!newAdminData.name || !newAdminData.email || !newAdminData.password) {
      addError('error', '모든 필수 항목을 입력해주세요.', true, 3000);
      return;
    }
    
    if (newAdminData.password !== newAdminData.confirmPassword) {
      addError('error', '비밀번호가 일치하지 않습니다.', true, 3000);
      return;
    }
    
    try {
      // 실제로는 API 호출하여 관리자 계정 생성
      await new Promise(resolve => setTimeout(resolve, 1000)); // 시뮬레이션
      
      // 새 관리자 계정 생성
      const newAdmin = {
        id: `ADM-00${adminAccounts.length + 1}`,
        name: newAdminData.name,
        email: newAdminData.email,
        role: newAdminData.role,
        lastLogin: '-',
        status: 'active',
        createdAt: new Date().toISOString()
      };
      
      // 상태 업데이트
      setAdminAccounts(prev => [...prev, newAdmin]);
      
      // 모달 닫기 및 폼 초기화
      setShowCreateModal(false);
      setNewAdminData({
        name: '',
        email: '',
        role: 'support-admin',
        password: '',
        confirmPassword: ''
      });
      
      addError('success', '관리자 계정이 성공적으로 생성되었습니다.', true, 3000);
    } catch (error) {
      addError('error', '계정 생성 중 오류가 발생했습니다.', true, 5000);
    }
  };
  
  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      // 실제로는 API 호출하여 상태 변경
      await new Promise(resolve => setTimeout(resolve, 500)); // 시뮬레이션
      
      // 상태 업데이트
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      setAdminAccounts(prev => 
        prev.map(admin => 
          admin.id === id ? { ...admin, status: newStatus } : admin
        )
      );
      
      const statusText = newStatus === 'active' ? '활성화' : '비활성화';
      addError('success', `관리자 계정이 ${statusText}되었습니다.`, true, 3000);
    } catch (error) {
      addError('error', '상태 변경 중 오류가 발생했습니다.', true, 5000);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewAdminData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const getSearchedSenderStats = () => {
    if (!searchTerm) return null;
    const sender = sampleSenderData.find(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return sender ? sender.totalRequests : null;
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
            <h1 className="text-2xl font-bold text-gray-900">관리자 계정 관리</h1>
            <p className="text-gray-600 mt-1">시스템 관리자 계정을 생성하고 관리할 수 있습니다.</p>
          </div>
          <Button 
            variant="primary" 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            새 관리자 추가
          </Button>
        </div>
        
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>통계</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900">전체 발송인</h3>
                <p className="mt-2 text-3xl font-bold text-blue-600">{stats.totalSenders}명</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900">총 발송 건수</h3>
                <p className="mt-2 text-3xl font-bold text-green-600">{stats.totalRequests}건</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900">평균 발송 건수</h3>
                <p className="mt-2 text-3xl font-bold text-purple-600">
                  {stats.averageRequestsPerSender.toFixed(1)}건
                </p>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  placeholder="발송인 이름으로 검색"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {searchTerm && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <h4 className="text-sm font-medium text-gray-700">검색 결과</h4>
                  {getSearchedSenderStats() !== null ? (
                    <p className="mt-2 text-lg font-semibold">
                      발송 건수: <span className="text-blue-600">{getSearchedSenderStats()}건</span>
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-gray-500">검색된 발송인이 없습니다.</p>
                  )}
                </div>
              )}
            </div>

            {/* 관리자 계정 목록 */}
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
                      이메일
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      역할
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      마지막 로그인
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      생성일
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
                  {adminAccounts.map((admin) => (
                    <tr key={admin.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {admin.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {admin.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {admin.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${roleConfig[admin.role as keyof typeof roleConfig].color}`}>
                          {roleConfig[admin.role as keyof typeof roleConfig].label}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          {roleConfig[admin.role as keyof typeof roleConfig].description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {admin.lastLogin !== '-' ? formatDate(admin.lastLogin) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(admin.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${statusConfig[admin.status as keyof typeof statusConfig].color}`}>
                          {statusConfig[admin.status as keyof typeof statusConfig].text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {admin.role !== 'super-admin' && (
                          <>
                            <button 
                              onClick={() => handleToggleStatus(admin.id, admin.status)}
                              className={`${
                                admin.status === 'active' 
                                  ? 'text-red-600 hover:text-red-900' 
                                  : 'text-green-600 hover:text-green-900'
                              } mr-4`}
                            >
                              {admin.status === 'active' ? '비활성화' : '활성화'}
                            </button>
                            <button 
                              className="text-blue-600 hover:text-blue-900"
                              onClick={() => addError('info', '이 기능은 아직 구현되지 않았습니다.', true, 3000)}
                            >
                              수정
                            </button>
                          </>
                        )}
                        {admin.role === 'super-admin' && (
                          <span className="text-gray-400">기본 계정</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {adminAccounts.length === 0 && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">관리자 계정이 없습니다</h3>
                <p className="mt-1 text-sm text-gray-500">새 관리자 계정을 추가해주세요.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </Container>
      
      {/* 새 관리자 추가 모달 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">새 관리자 계정 추가</h3>
            </div>
            
            <form onSubmit={handleCreateAdmin}>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    이름
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={newAdminData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    이메일
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={newAdminData.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    역할
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={newAdminData.role}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="approval-admin">승인 관리자</option>
                    <option value="support-admin">지원 관리자</option>
                    <option value="read-only">읽기 전용</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    비밀번호
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={newAdminData.password}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    비밀번호 확인
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={newAdminData.confirmPassword}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
              </div>
              
              <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3 rounded-b-lg">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  계정 생성
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 