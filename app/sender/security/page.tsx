'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useError } from '@/components/ErrorHandler';
import Container from '@/components/ui/Container';
import Card, { CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

// 샘플 로그인 기록 데이터
const sampleLoginHistory = [
  {
    id: 1,
    date: '2023-11-07 14:32:45',
    ipAddress: '192.168.1.1',
    device: 'Chrome on Windows',
    location: '서울, 대한민국',
    status: 'success'
  },
  {
    id: 2,
    date: '2023-11-06 09:15:22',
    ipAddress: '192.168.1.1',
    device: 'Safari on macOS',
    location: '서울, 대한민국',
    status: 'success'
  },
  {
    id: 3,
    date: '2023-11-05 18:45:10',
    ipAddress: '203.45.67.89',
    device: 'Firefox on Windows',
    location: '부산, 대한민국',
    status: 'failed'
  },
  {
    id: 4,
    date: '2023-11-04 11:22:33',
    ipAddress: '192.168.1.1',
    device: 'Chrome on Windows',
    location: '서울, 대한민국',
    status: 'success'
  },
  {
    id: 5,
    date: '2023-11-03 16:08:59',
    ipAddress: '192.168.1.1',
    device: 'Chrome on Windows',
    location: '서울, 대한민국',
    status: 'success'
  }
];

export default function SenderSecurity() {
  const router = useRouter();
  const { addError } = useError();
  const [isLoading, setIsLoading] = useState(true);
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isEnabling2FA, setIsEnabling2FA] = useState(false);
  
  useEffect(() => {
    // 실제로는 API에서 사용자 보안 설정 및 로그인 기록을 가져옴
    const fetchSecurityData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1500)); // 로딩 시뮬레이션
        setLoginHistory(sampleLoginHistory);
        setIsLoading(false);
      } catch (error) {
        addError('error', '보안 데이터를 불러오는 중 오류가 발생했습니다.', true, 5000);
        setIsLoading(false);
      }
    };
    
    fetchSecurityData();
  }, [addError]);
  
  const handleToggle2FA = () => {
    if (twoFactorEnabled) {
      // 2FA 비활성화 확인
      if (window.confirm('2단계 인증을 비활성화하시겠습니까? 계정 보안이 약화될 수 있습니다.')) {
        setIsEnabling2FA(true);
        // 실제로는 API 호출하여 2FA 비활성화
        setTimeout(() => {
          setTwoFactorEnabled(false);
          setShowQrCode(false);
          setIsEnabling2FA(false);
          addError('success', '2단계 인증이 비활성화되었습니다.', true, 3000);
        }, 1500);
      }
    } else {
      // 2FA 활성화 시작
      setShowQrCode(true);
    }
  };
  
  const handleVerify2FA = () => {
    if (!verificationCode) {
      addError('error', '인증 코드를 입력해주세요.', true, 3000);
      return;
    }
    
    setIsEnabling2FA(true);
    // 실제로는 API 호출하여 2FA 코드 검증
    setTimeout(() => {
      if (verificationCode === '123456' || verificationCode === '654321') {
        setTwoFactorEnabled(true);
        setShowQrCode(false);
        setVerificationCode('');
        addError('success', '2단계 인증이 활성화되었습니다.', true, 3000);
      } else {
        addError('error', '잘못된 인증 코드입니다. 다시 시도해주세요.', true, 3000);
      }
      setIsEnabling2FA(false);
    }, 1500);
  };
  
  const handleCancelSetup2FA = () => {
    setShowQrCode(false);
    setVerificationCode('');
  };
  
  const handleChangePassword = () => {
    // 입력 검증
    if (!currentPassword) {
      addError('error', '현재 비밀번호를 입력해주세요.', true, 3000);
      return;
    }
    
    if (!newPassword) {
      addError('error', '새 비밀번호를 입력해주세요.', true, 3000);
      return;
    }
    
    if (newPassword !== confirmPassword) {
      addError('error', '새 비밀번호와 확인 비밀번호가 일치하지 않습니다.', true, 3000);
      return;
    }
    
    if (newPassword.length < 8) {
      addError('error', '비밀번호는 8자 이상이어야 합니다.', true, 3000);
      return;
    }
    
    setIsChangingPassword(true);
    // 실제로는 API 호출하여 비밀번호 변경
    setTimeout(() => {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsChangingPassword(false);
      addError('success', '비밀번호가 성공적으로 변경되었습니다.', true, 3000);
    }, 1500);
  };
  
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
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">보안 설정</h1>
          <p className="text-gray-600 mt-1">계정 보안 설정을 관리하고 로그인 기록을 확인할 수 있습니다.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 왼쪽 열: 2단계 인증 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>2단계 인증 (2FA)</CardTitle>
                <CardDescription>
                  2단계 인증을 설정하여 계정 보안을 강화하세요. 로그인 시 추가 인증 단계가 필요합니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!showQrCode ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {twoFactorEnabled ? '활성화됨' : '비활성화됨'}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {twoFactorEnabled 
                          ? '2단계 인증이 활성화되어 있습니다. 로그인 시 인증 앱의 코드가 필요합니다.' 
                          : '2단계 인증을 활성화하면 계정 보안이 강화됩니다.'}
                      </p>
                    </div>
                    <Button
                      onClick={handleToggle2FA}
                      variant={twoFactorEnabled ? 'outline' : 'primary'}
                      disabled={isEnabling2FA}
                    >
                      {isEnabling2FA ? (
                        <>
                          <span className="animate-spin mr-2">⟳</span>
                          처리 중...
                        </>
                      ) : (
                        twoFactorEnabled ? '비활성화' : '활성화'
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm text-yellow-800">
                        <strong>중요:</strong> 2단계 인증을 설정하려면 Google Authenticator 또는 Microsoft Authenticator와 같은 인증 앱이 필요합니다.
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <div className="w-48 h-48 bg-gray-200 flex items-center justify-center mb-4 border border-gray-300">
                        {/* 실제 구현에서는 실제 QR 코드 이미지 표시 */}
                        <div className="text-center">
                          <p className="text-gray-500 text-sm">QR 코드</p>
                          <p className="text-gray-700 font-mono mt-2">ABCDEF123456</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-4 text-center">
                        인증 앱으로 위 QR 코드를 스캔하거나 다음 코드를 수동으로 입력하세요:
                      </p>
                      <div className="bg-gray-100 px-4 py-2 rounded-md font-mono text-center mb-6">
                        ABCDEF123456
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-1">
                          인증 코드 입력
                        </label>
                        <input
                          type="text"
                          id="verificationCode"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          placeholder="6자리 코드 입력"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          maxLength={6}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          인증 앱에 표시된 6자리 코드를 입력하세요.
                        </p>
                      </div>
                      
                      <div className="flex space-x-3">
                        <Button
                          onClick={handleVerify2FA}
                          variant="primary"
                          disabled={isEnabling2FA}
                          className="flex-1"
                        >
                          {isEnabling2FA ? (
                            <>
                              <span className="animate-spin mr-2">⟳</span>
                              확인 중...
                            </>
                          ) : (
                            '확인'
                          )}
                        </Button>
                        <Button
                          onClick={handleCancelSetup2FA}
                          variant="outline"
                          disabled={isEnabling2FA}
                          className="flex-1"
                        >
                          취소
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* 비밀번호 변경 */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>비밀번호 변경</CardTitle>
                <CardDescription>
                  정기적으로 비밀번호를 변경하여 계정 보안을 유지하세요.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      현재 비밀번호
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      새 비밀번호
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      8자 이상, 대소문자, 숫자, 특수문자를 포함해야 합니다.
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      새 비밀번호 확인
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  onClick={handleChangePassword}
                  variant="primary"
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? (
                    <>
                      <span className="animate-spin mr-2">⟳</span>
                      변경 중...
                    </>
                  ) : (
                    '비밀번호 변경'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* 오른쪽 열: 로그인 기록 */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>로그인 기록</CardTitle>
                <CardDescription>
                  최근 로그인 활동을 확인하여 의심스러운 접근이 있는지 확인하세요.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loginHistory.map((login) => (
                    <div 
                      key={login.id} 
                      className={`p-3 rounded-md border ${
                        login.status === 'success' ? 'border-gray-200' : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {login.date}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {login.device}
                          </p>
                        </div>
                        <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                          login.status === 'success' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {login.status === 'success' ? '성공' : '실패'}
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-600">
                        <p>IP: {login.ipAddress}</p>
                        <p>위치: {login.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => {/* 전체 로그인 기록 보기 */}}
                  variant="outline"
                  className="w-full"
                >
                  전체 로그인 기록 보기
                </Button>
              </CardFooter>
            </Card>
            
            {/* 보안 팁 */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>보안 팁</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex">
                    <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>정기적으로 비밀번호를 변경하세요.</span>
                  </li>
                  <li className="flex">
                    <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>2단계 인증을 활성화하여 보안을 강화하세요.</span>
                  </li>
                  <li className="flex">
                    <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>공용 컴퓨터에서 로그인 후 반드시 로그아웃하세요.</span>
                  </li>
                  <li className="flex">
                    <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>의심스러운 로그인 활동이 있으면 즉시 비밀번호를 변경하세요.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
} 