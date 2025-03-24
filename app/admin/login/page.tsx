'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useError } from '@/components/ErrorHandler';
import Container from '@/components/ui/Container';
import Card, { CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Image from 'next/image';

export default function AdminLogin() {
  const router = useRouter();
  const { addError } = useError();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 입력 검증
    if (!formData.email || !formData.password) {
      addError('error', '이메일과 비밀번호를 모두 입력해주세요.', true, 3000);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 실제로는 API 호출하여 로그인 처리
      await new Promise(resolve => setTimeout(resolve, 1500)); // 로딩 시뮬레이션
      
      // 관리자 계정 확인 (실제로는 서버에서 처리)
      if (formData.email === 'admin@example.com' && formData.password === 'admin123') {
        // 로그인 성공
        addError('success', '로그인에 성공했습니다.', true, 3000);
        
        // 세션 스토리지에 관리자 정보 저장 (실제로는 토큰 기반 인증 사용)
        sessionStorage.setItem('adminLoggedIn', 'true');
        sessionStorage.setItem('adminEmail', formData.email);
        
        // 대시보드로 이동
        router.push('/admin/dashboard');
      } else {
        // 로그인 실패
        addError('error', '이메일 또는 비밀번호가 올바르지 않습니다.', true, 3000);
      }
    } catch (error) {
      addError('error', '로그인 중 오류가 발생했습니다.', true, 5000);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Container maxWidth="sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center">
              <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">관리자 로그인</h2>
          <p className="mt-2 text-sm text-gray-600">
            전자서명 시스템 관리자 페이지에 접속합니다.
          </p>
        </div>
        
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  이메일
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="admin@example.com"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  비밀번호
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
                    로그인 상태 유지
                  </label>
                </div>
                
                <div className="text-sm">
                  <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                    비밀번호를 잊으셨나요?
                  </a>
                </div>
              </div>
              
              <div>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full flex justify-center py-2 px-4"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      로그인 중...
                    </>
                  ) : (
                    '로그인'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
          
          <CardFooter className="bg-gray-50 px-4 py-3 sm:px-6 border-t border-gray-200">
            <div className="text-sm text-center text-gray-500">
              <p>관리자 계정이 필요하신가요? <a href="#" className="font-medium text-blue-600 hover:text-blue-500">관리자에게 문의하세요</a></p>
            </div>
          </CardFooter>
        </Card>
        
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>테스트 계정: admin@example.com / admin123</p>
        </div>
      </Container>
    </div>
  );
} 