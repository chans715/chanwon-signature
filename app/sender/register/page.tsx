'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useError } from '@/components/ErrorHandler';
import Container from '@/components/ui/Container';
import Card, { CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function SenderRegister() {
  const router = useRouter();
  const { addError } = useError();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    position: '',
    phone: '',
    agreeTerms: false
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
    
    // 유효성 검사
    if (!formData.name || !formData.email || !formData.password || !formData.company || !formData.phone) {
      addError('warning', '모든 필수 항목을 입력해주세요.', true, 3000);
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      addError('error', '비밀번호가 일치하지 않습니다.', true, 3000);
      return;
    }
    
    if (!formData.agreeTerms) {
      addError('warning', '이용약관에 동의해주세요.', true, 3000);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 실제로는 여기서 API 호출하여 회원가입 요청
      await new Promise(resolve => setTimeout(resolve, 1500)); // 시뮬레이션
      
      // 회원가입 성공 메시지
      addError('success', '회원가입 요청이 완료되었습니다. 관리자 승인 후 이용 가능합니다.', true, 5000);
      
      // 대기 페이지로 이동
      router.push('/sender/pending');
    } catch (error) {
      addError('error', '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.', true, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <Container maxWidth="md">
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>발송인 회원가입</CardTitle>
            <CardDescription>
              전자서명 문서를 발송하기 위한 계정을 생성합니다. 회원가입 후 관리자 승인이 필요합니다.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    회원가입 후 관리자 승인이 필요합니다. 승인은 영업일 기준 1-2일 내에 처리됩니다.
                  </p>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 이름 */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      이름 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  {/* 이메일 */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      이메일 <span className="text-red-500">*</span>
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
                      비밀번호 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      minLength={8}
                    />
                    <p className="mt-1 text-xs text-gray-500">8자 이상, 영문, 숫자, 특수문자 조합</p>
                  </div>
                  
                  {/* 비밀번호 확인 */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      비밀번호 확인 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  {/* 회사명 */}
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                      회사명 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  {/* 직책 */}
                  <div>
                    <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                      직책
                    </label>
                    <input
                      type="text"
                      id="position"
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  {/* 전화번호 */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      전화번호 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      placeholder="010-0000-0000"
                    />
                  </div>
                </div>
                
                {/* 이용약관 동의 */}
                <div className="mt-4">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="agreeTerms"
                        name="agreeTerms"
                        type="checkbox"
                        checked={formData.agreeTerms}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        required
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="agreeTerms" className="font-medium text-gray-700">
                        이용약관 및 개인정보 처리방침에 동의합니다. <span className="text-red-500">*</span>
                      </label>
                      <p className="text-gray-500">
                        <Link href="/terms" className="text-blue-600 hover:underline">
                          이용약관
                        </Link>
                        {' '}및{' '}
                        <Link href="/privacy" className="text-blue-600 hover:underline">
                          개인정보 처리방침
                        </Link>
                        을 읽고 이해했으며 이에 동의합니다.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button 
              href="/" 
              variant="outline"
            >
              취소
            </Button>
            <Button 
              onClick={handleSubmit}
              loading={isSubmitting}
              disabled={isSubmitting}
              variant="primary"
            >
              회원가입 신청
            </Button>
          </CardFooter>
        </Card>
      </Container>
    </div>
  );
} 