'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Container from '@/components/ui/Container';
import Card, { CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useError } from '@/components/ErrorHandler';

export default function SenderLogin() {
  const router = useRouter();
  const { addError } = useError();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 테스트 계정은 그대로 유지
      if (formData.email === 'test@example.com' && formData.password === 'password') {
        sessionStorage.setItem('sender_logged_in', 'true');
        sessionStorage.setItem('sender_email', formData.email);
        
        addError('success', '로그인에 성공했습니다.', true, 2000);
        router.push('/sender/dashboard');
        return;
      }

      // 로컬 스토리지에서 회원 정보 확인
      const registrationRequestsStr = localStorage.getItem('registrationRequests');
      if (registrationRequestsStr) {
        const registrationRequests = JSON.parse(registrationRequestsStr);
        
        // 이메일과 비밀번호가 일치하고 승인된 회원인지 확인
        const user = registrationRequests.find(
          (req: any) => req.email === formData.email && 
                    req.password === formData.password && 
                    req.status === 'approved'
        );
        
        if (user) {
          // 로그인 성공 처리
          sessionStorage.setItem('sender_logged_in', 'true');
          sessionStorage.setItem('sender_email', formData.email);
          sessionStorage.setItem('sender_name', user.name);
          
          addError('success', '로그인에 성공했습니다.', true, 2000);
          router.push('/sender/dashboard');
          return;
        }
        
        // 승인되지 않은 사용자 체크
        const pendingUser = registrationRequests.find(
          (req: any) => req.email === formData.email && 
                    req.password === formData.password && 
                    req.status === 'pending'
        );
        
        if (pendingUser) {
          addError('warning', '회원가입 승인 대기 중입니다. 관리자 승인 후 로그인 가능합니다.', true, 4000);
          return;
        }
      }
      
      // 로그인 실패
      addError('error', '이메일 또는 비밀번호가 잘못되었습니다.', true, 3000);
    } catch (error) {
      addError('error', '로그인 중 오류가 발생했습니다.', true, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <Container maxWidth="sm">
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="text-center">발송인 로그인</CardTitle>
            <CardDescription className="text-center">
              서명 요청을 보내기 위해 로그인해주세요.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  이메일
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your@email.com"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  비밀번호
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember_me"
                    name="remember_me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-700">
                    로그인 상태 유지
                  </label>
                </div>
                
                <div className="text-sm">
                  <a href="#" className="text-blue-600 hover:text-blue-500">
                    비밀번호를 잊으셨나요?
                  </a>
                </div>
              </div>
              
              <div>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  loading={isLoading}
                >
                  로그인
                </Button>
              </div>
            </form>
          </CardContent>
          
          <CardFooter className="justify-center border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-600">
              계정이 없으신가요?{' '}
              <Link href="/sender/register" className="text-blue-600 hover:text-blue-500">
                회원가입
              </Link>
            </p>
          </CardFooter>
        </Card>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            테스트 계정: test@example.com / password
          </p>
        </div>
      </Container>
    </div>
  );
} 