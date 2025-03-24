'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import Input from '@/components/ui/Input';

export default function Auth() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePassAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 입력 검증
    if (!name || !phone || !birthdate) {
      setError('모든 필드를 입력해주세요.');
      return;
    }
    
    if (phone.length !== 11 || !/^\d+$/.test(phone)) {
      setError('올바른 휴대폰 번호를 입력해주세요. (11자리 숫자)');
      return;
    }
    
    if (birthdate.length !== 6 || !/^\d+$/.test(birthdate)) {
      setError('올바른 생년월일을 입력해주세요. (6자리 숫자)');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    // PASS 인증 시뮬레이션
    try {
      // 실제로는 여기서 PASS 인증 API를 호출합니다
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2초 지연
      
      // 인증 정보를 세션 스토리지에 저장
      sessionStorage.setItem('userAuth', JSON.stringify({
        name,
        phone,
        birthdate,
        authDate: new Date().toISOString(),
        isAuthenticated: true
      }));
      
      // 인증 성공 후 가이드 페이지로 이동
      router.push('/guide');
    } catch (err) {
      setError('인증 과정에서 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <Container maxWidth="sm">
        <Card variant="elevated" className="overflow-hidden">
          <CardHeader>
            <CardTitle>본인인증</CardTitle>
            <CardDescription>
              안전한 전자서명을 위해 본인인증이 필요합니다. PASS 인증을 통해 본인 확인을 진행해주세요.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md text-sm">
                <div className="flex">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {error}
                </div>
              </div>
            )}
            
            <form onSubmit={handlePassAuth} className="space-y-6">
              <Input
                label="이름"
                id="name"
                type="text"
                placeholder="이름을 입력하세요"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
                required
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
              />
              
              <Input
                label="휴대폰 번호"
                id="phone"
                type="tel"
                placeholder="휴대폰 번호를 입력하세요 (- 없이)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                fullWidth
                required
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                }
              />
              
              <Input
                label="생년월일"
                id="birthdate"
                type="text"
                placeholder="생년월일 6자리 (예: 901231)"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                fullWidth
                required
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                }
              />
            </form>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button 
              href="/" 
              variant="outline"
            >
              이전
            </Button>
            <Button 
              onClick={handlePassAuth}
              loading={isLoading}
              disabled={isLoading}
            >
              PASS 인증하기
            </Button>
          </CardFooter>
        </Card>
        
        <div className="mt-8 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-blue-50 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">안전한 인증 시스템</h3>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            PASS 인증은 통신사가 제공하는 안전한 본인확인 서비스입니다. 
            개인정보는 암호화되어 전송되며 서비스 이용 후 즉시 파기됩니다.
          </p>
        </div>
      </Container>
    </div>
  );
} 