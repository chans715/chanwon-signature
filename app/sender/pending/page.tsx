'use client';

import Link from 'next/link';
import Container from '@/components/ui/Container';
import Card, { CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function SenderPending() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <Container maxWidth="md">
        <Card variant="elevated">
          <CardHeader>
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
              <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <CardTitle className="text-center">회원가입 승인 대기 중</CardTitle>
            <CardDescription className="text-center">
              회원가입 요청이 접수되었습니다. 관리자 승인 후 서비스를 이용하실 수 있습니다.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    승인은 영업일 기준 1-2일 내에 처리됩니다. 승인이 완료되면 등록하신 이메일로 알림이 발송됩니다.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">승인 절차 안내</h3>
                <ol className="list-decimal list-inside space-y-3 text-sm text-gray-600">
                  <li>관리자가 회원가입 요청을 검토합니다.</li>
                  <li>필요한 경우, 추가 정보 확인을 위해 이메일이나 전화로 연락드릴 수 있습니다.</li>
                  <li>승인이 완료되면 등록하신 이메일로 알림이 발송됩니다.</li>
                  <li>이메일에 포함된 링크를 통해 로그인하시면 서비스를 이용하실 수 있습니다.</li>
                </ol>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">문의 안내</h3>
                <p className="text-sm text-gray-600 mb-4">
                  승인 과정에 대해 문의사항이 있으시면 아래 연락처로 문의해 주세요.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex">
                    <span className="font-medium w-20">이메일:</span>
                    <span>support@example.com</span>
                  </li>
                  <li className="flex">
                    <span className="font-medium w-20">전화:</span>
                    <span>02-1234-5678 (평일 09:00-18:00)</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-center">
            <Button 
              href="/" 
              variant="primary"
            >
              홈으로 돌아가기
            </Button>
          </CardFooter>
        </Card>
      </Container>
    </div>
  );
} 