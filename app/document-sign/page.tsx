'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useError } from '@/components/ErrorHandler';
import Container from '@/components/ui/Container';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

// 샘플 문서 이미지 (실제로는 API에서 가져옴)
const sampleDocuments = [
  {
    id: 1,
    imageUrl: '/images/document1.jpg',
    signaturePositions: [
      { id: 's1', x: 70, y: 70, width: 150, height: 60 }
    ]
  },
  {
    id: 2,
    imageUrl: '/images/document2.jpg',
    signaturePositions: [
      { id: 's2', x: 70, y: 150, width: 150, height: 60 },
      { id: 's3', x: 70, y: 300, width: 150, height: 60 }
    ]
  },
  {
    id: 3,
    imageUrl: '/images/document3.jpg',
    signaturePositions: [
      { id: 's4', x: 70, y: 400, width: 150, height: 60 }
    ]
  }
];

export default function DocumentSign() {
  const router = useRouter();
  const { addError } = useError();
  const [currentDocIndex, setCurrentDocIndex] = useState(0);
  const [signedPositions, setSignedPositions] = useState<Record<string, boolean>>({});
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 현재 문서와 서명 위치
  const currentDocument = sampleDocuments[currentDocIndex];
  const totalDocuments = sampleDocuments.length;
  
  // 세션 스토리지에서 서명 이미지 가져오기
  useEffect(() => {
    const savedSignature = sessionStorage.getItem('userSignature');
    if (savedSignature) {
      setSignatureImage(savedSignature);
    } else {
      addError('error', '저장된 서명을 찾을 수 없습니다. 서명을 다시 입력해주세요.', true, 5000);
      router.push('/signature');
    }
    setIsLoading(false);
  }, [addError, router]);
  
  // 서명 위치에 서명 추가
  const addSignature = (positionId: string) => {
    setSignedPositions(prev => ({
      ...prev,
      [positionId]: true
    }));
    
    addError('success', '서명이 추가되었습니다.', true, 2000);
  };
  
  // 현재 문서의 모든 위치에 서명이 되었는지 확인
  const isCurrentDocumentFullySigned = () => {
    return currentDocument.signaturePositions.every(pos => signedPositions[pos.id]);
  };
  
  // 다음 문서로 이동
  const goToNextDocument = () => {
    if (!isCurrentDocumentFullySigned()) {
      addError('warning', '모든 서명 위치에 서명을 추가해주세요.', true, 3000);
      return;
    }
    
    if (currentDocIndex < totalDocuments - 1) {
      setCurrentDocIndex(prev => prev + 1);
      addError('info', `${currentDocIndex + 2}번째 문서로 이동합니다.`, true, 2000);
    } else {
      // 모든 문서에 서명 완료
      addError('success', '모든 문서에 서명이 완료되었습니다.', true, 3000);
      
      // 서명 완료 정보 저장
      sessionStorage.setItem('documentsSignedCount', totalDocuments.toString());
      sessionStorage.setItem('documentsSignedDate', new Date().toISOString());
      
      // 서명된 문서 정보 저장
      const signedDocuments = sampleDocuments.map(doc => ({
        id: doc.id,
        imageUrl: doc.imageUrl,
        signaturePositions: doc.signaturePositions.map(pos => ({
          ...pos,
          signed: signedPositions[pos.id] || false
        }))
      }));
      sessionStorage.setItem('signedDocuments', JSON.stringify(signedDocuments));
      
      // 신분증 업로드 페이지로 이동
      router.push('/id-card');
    }
  };
  
  // 이전 문서로 이동
  const goToPrevDocument = () => {
    if (currentDocIndex > 0) {
      setCurrentDocIndex(prev => prev - 1);
    }
  };
  
  // 모든 문서에 서명이 완료되었는지 확인
  const areAllDocumentsSigned = () => {
    return sampleDocuments.every(doc => 
      doc.signaturePositions.every(pos => signedPositions[pos.id])
    );
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
        <Container maxWidth="xl">
          <Card variant="elevated">
            <CardContent>
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            </CardContent>
          </Card>
        </Container>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <Container maxWidth="xl">
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>문서 서명</CardTitle>
            <CardDescription>
              문서 {currentDocIndex + 1} / {totalDocuments}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {/* 안내 문구 추가 */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    해당 문서를 읽어보시고, 밑에 <span className="font-bold">서명등록</span> 버튼을 클릭해주세요.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="relative border border-gray-300 rounded-md mb-6 overflow-hidden">
              {/* 문서 이미지 */}
              <div className="relative w-full h-[600px]">
                <Image 
                  src={currentDocument.imageUrl} 
                  alt={`문서 ${currentDocIndex + 1}`}
                  fill
                  style={{ objectFit: 'contain' }}
                  className="bg-white"
                />
                
                {/* 서명 위치 표시 */}
                {currentDocument.signaturePositions.map((position) => (
                  <div
                    key={position.id}
                    className={`absolute border-2 ${
                      signedPositions[position.id] ? 'border-green-500 bg-green-50' : 'border-red-500 animate-pulse'
                    } rounded-md flex items-center justify-center`}
                    style={{
                      left: `${position.x}px`,
                      top: `${position.y}px`,
                      width: `${position.width}px`,
                      height: `${position.height}px`,
                    }}
                  >
                    {signedPositions[position.id] ? (
                      <Image 
                        src={signatureImage || ''} 
                        alt="서명" 
                        width={position.width - 10} 
                        height={position.height - 10}
                        style={{ objectFit: 'contain' }}
                      />
                    ) : (
                      <span className="text-xs text-red-500 font-medium">서명 필요</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* 서명 버튼 */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">서명 추가하기</h3>
              <div className="flex flex-wrap gap-2">
                {currentDocument.signaturePositions.map((position, index) => (
                  <Button
                    key={position.id}
                    onClick={() => addSignature(position.id)}
                    disabled={signedPositions[position.id]}
                    variant={signedPositions[position.id] ? "success" : "primary"}
                    size="sm"
                    icon={
                      signedPositions[position.id] ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      )
                    }
                  >
                    {signedPositions[position.id] ? '서명 완료' : `서명등록 ${index + 1}`}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* 네비게이션 버튼 */}
            <div className="flex justify-between mt-8">
              {currentDocIndex > 0 ? (
                <Button
                  onClick={goToPrevDocument}
                  variant="outline"
                >
                  이전 문서
                </Button>
              ) : (
                <Button 
                  href="/signature" 
                  variant="outline"
                >
                  서명 수정
                </Button>
              )}
              
              {currentDocIndex < totalDocuments - 1 ? (
                <Button
                  onClick={goToNextDocument}
                  disabled={!isCurrentDocumentFullySigned()}
                  variant="primary"
                >
                  다음 문서
                </Button>
              ) : (
                <Button
                  onClick={goToNextDocument}
                  disabled={!isCurrentDocumentFullySigned()}
                  variant="success"
                >
                  서명 완료
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
} 