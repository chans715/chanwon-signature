'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useError } from '@/components/ErrorHandler';
import Container from '@/components/ui/Container';
import Card, { CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ReCAPTCHA from 'react-google-recaptcha';
import CryptoJS from 'crypto-js';

export default function SenderLogin() {
  const router = useRouter();
  const { addError } = useError();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [recaptchaValue, setRecaptchaValue] = useState('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleRecaptchaChange = (value: string | null) => {
    setRecaptchaValue(value || '');
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 유효성 검사
    if (!formData.email || !formData.password) {
      addError('warning', '이메일과 비밀번호를 입력해주세요.', true, 3000);
      return;
    }
    
    setIsLoggingIn(true);
    
    try {
      // 비밀번호 암호화
      const encryptedPassword = CryptoJS.AES.encrypt(formData.password, 'your-secret-key').toString();
      
      // 로그인 API 호출
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          encryptedPassword,
        }),
      });
      
      if (response.ok) {
        addError('success', '로그인 성공! 대시보드로 이동합니다.', true, 3000);
        router.push('/sender/dashboard');
      } else {
        const errorData = await response.json();
        addError('error', errorData.error || '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.', true, 5000);
      }
    } catch (error) {
      addError('error', '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.', true, 5000);
    } finally {
      setIsLoggingIn(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <Container maxWidth="sm">
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>발송인 로그인</CardTitle>
            <CardDescription>
              전자서명 문서 발송을 위한 계정으로 로그인합니다.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 이메일 */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  이메일
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              {/* 비밀번호 */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  비밀번호
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              {/* 로그인 유지 및 비밀번호 찾기 */}
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
                  <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                    로그인 상태 유지
                  </label>
                </div>
                
                <div className="text-sm">
                  <Link href="/sender/forgot-password" className="text-blue-600 hover:text-blue-800">
                    비밀번호를 잊으셨나요?
                  </Link>
                </div>
              </div>
              
              {/* 로그인 버튼 */}
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={isLoggingIn}
                disabled={!formData.email || !formData.password || !recaptchaValue}
              >
                로그인
              </Button>
              
              {/* 회원가입 링크 */}
              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  계정이 없으신가요?{' '}
                  <Link href="/sender/register" className="text-blue-600 hover:text-blue-800 font-medium">
                    회원가입
                  </Link>
                </p>
              </div>
            </form>
            
            <ReCAPTCHA
              sitekey="YOUR_RECAPTCHA_SITE_KEY"
              onChange={handleRecaptchaChange}
            />
          </CardContent>
        </Card>
      </Container>
    </div>
  );
} 