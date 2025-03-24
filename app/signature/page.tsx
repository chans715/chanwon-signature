'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useError } from '@/components/ErrorHandler';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';

// 클라이언트 컴포넌트를 동적으로 불러옵니다
const SignaturePadClient = dynamic(
  () => import('../../components/SignaturePadClient'),
  { ssr: false }
);

export default function Signature() {
  const router = useRouter();
  const { addError } = useError();
  const [isSignatureSaved, setIsSignatureSaved] = useState(false);
  const prevSavedStateRef = useRef(false);
  
  // 이전 저장 상태를 추적
  useEffect(() => {
    prevSavedStateRef.current = isSignatureSaved;
  }, [isSignatureSaved]);
  
  const handleSignatureStatusChange = (isSaved: boolean) => {
    // 상태가 변경될 때만 업데이트
    if (isSignatureSaved !== isSaved) {
      setIsSignatureSaved(isSaved);
      
      // 저장되지 않은 상태에서 저장된 상태로 변경될 때만 메시지 표시
      if (isSaved && !prevSavedStateRef.current) {
        addError('success', '서명이 성공적으로 저장되었습니다.', true, 3000);
      }
    }
  };
  
  const handleNext = () => {
    if (!isSignatureSaved) {
      addError('warning', '서명을 입력하고 저장해주세요.', true, 3000);
      return;
    }
    
    router.push('/document-sign');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <Container maxWidth="md">
        <Card variant="elevated" className="overflow-hidden">
          <CardHeader>
            <CardTitle>전자서명 입력</CardTitle>
            <CardDescription>
              아래 서명란에 터치하여 서명을 입력해주세요. 모바일 기기에서는 손가락으로, 
              PC에서는 마우스로 서명할 수 있습니다.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex items-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">서명 작성 안내</span>
              </div>
              <ul className="text-sm text-gray-600 space-y-2 ml-7 list-disc">
                <li>서명은 법적 효력이 있는 본인 확인 수단입니다.</li>
                <li>가능한 실제 서명과 유사하게 작성해주세요.</li>
                <li>서명 완료 후 반드시 저장 버튼을 눌러주세요.</li>
                <li>저장된 서명은 문서에 적용됩니다.</li>
              </ul>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 bg-white">
              <SignaturePadClient onSignatureStatusChange={handleSignatureStatusChange} />
            </div>
            
            <div className="mt-4 flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${isSignatureSaved ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className={`text-sm ${isSignatureSaved ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                {isSignatureSaved ? '서명이 저장되었습니다' : '서명을 저장해주세요'}
              </span>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button 
              href="/guide" 
              variant="outline"
            >
              이전
            </Button>
            <Button 
              onClick={handleNext}
              disabled={!isSignatureSaved}
              variant={isSignatureSaved ? 'primary' : 'secondary'}
            >
              다음
            </Button>
          </CardFooter>
        </Card>
        
        <div className="mt-8 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-blue-50 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">전자서명의 법적 효력</h3>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            전자서명법에 따라 전자서명은 서면 서명과 동일한 법적 효력을 가집니다.
            본인 확인 후 작성된 전자서명은 법적으로 유효한 서명으로 인정됩니다.
          </p>
        </div>
      </Container>
    </div>
  );
} 