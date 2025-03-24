'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Container from '@/components/ui/Container';
import Card, { CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useError } from '@/components/ErrorHandler';

// PDF 생성을 위한 라이브러리 (실제로는 jspdf, html2canvas 등을 사용)
// 이 예제에서는 간단한 시뮬레이션만 구현합니다

interface SignaturePosition {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  signed?: boolean;
}

interface Document {
  id: number;
  imageUrl: string;
  signaturePositions: SignaturePosition[];
}

export default function Complete() {
  const { addError } = useError();
  const [dateString, setDateString] = useState('');
  const [signatureId, setSignatureId] = useState('');
  const [signedDocuments, setSignedDocuments] = useState<Document[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<Record<number, boolean>>({});
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');

  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    setDateString(new Date().toLocaleString('ko-KR'));
    setSignatureId(`SIG-${Math.random().toString(36).substring(2, 10).toUpperCase()}`);
    
    // 세션 스토리지에서 서명된 문서 정보 가져오기
    const storedDocuments = sessionStorage.getItem('signedDocuments');
    if (storedDocuments) {
      const parsedDocuments = JSON.parse(storedDocuments);
      setSignedDocuments(parsedDocuments);
      
      // 기본적으로 모든 문서 선택
      const initialSelection: Record<number, boolean> = {};
      parsedDocuments.forEach((doc: Document) => {
        initialSelection[doc.id] = true;
      });
      setSelectedDocuments(initialSelection);
    }
  }, []);

  useEffect(() => {
    const sendCompletionNotification = async () => {
      try {
        // 실제 API 호출로 대체 필요
        await fetch('/api/notify-completion', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            signatureId: signatureId,
            recipientEmail: recipientEmail,
          }),
        });
        console.log('Notification sent successfully');
      } catch (error) {
        console.error('Failed to send notification', error);
      }
    };

    sendCompletionNotification();
  }, [signatureId, recipientEmail]);

  // 문서 선택 상태 토글
  const toggleDocumentSelection = (docId: number) => {
    setSelectedDocuments(prev => ({
      ...prev,
      [docId]: !prev[docId]
    }));
  };

  // 모든 문서 선택/해제
  const toggleAllDocuments = (select: boolean) => {
    const newSelection: Record<number, boolean> = {};
    signedDocuments.forEach(doc => {
      newSelection[doc.id] = select;
    });
    setSelectedDocuments(newSelection);
  };

  // 선택된 문서 수 계산
  const selectedCount = Object.values(selectedDocuments).filter(Boolean).length;

  // PDF 다운로드 시뮬레이션
  const downloadPdf = () => {
    if (selectedCount === 0) {
      addError('warning', '다운로드할 문서를 선택해주세요.', true, 3000);
      return;
    }
    
    setIsGeneratingPdf(true);
    
    // PDF 생성 시뮬레이션 (실제로는 jspdf, html2canvas 등을 사용)
    setTimeout(() => {
      // 선택된 문서만 필터링
      const docsToDownload = signedDocuments.filter(doc => selectedDocuments[doc.id]);
      
      // 실제 구현에서는 여기서 PDF 생성 및 다운로드 로직 구현
      console.log('다운로드할 문서:', docsToDownload);
      
      // 다운로드 시뮬레이션
      const link = document.createElement('a');
      link.href = '/sample-signed-document.pdf'; // 실제로는 동적으로 생성된 PDF URL
      link.download = `전자서명_문서_${signatureId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      addError('success', '문서가 성공적으로 다운로드되었습니다.', true, 3000);
      setIsGeneratingPdf(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <Container maxWidth="lg">
        <Card variant="elevated">
          <CardHeader>
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <CardTitle className="text-center">전자서명 완료</CardTitle>
            <CardDescription className="text-center">
              전자서명이 성공적으로 완료되었습니다. 서명된 문서는 등록된 이메일로 발송됩니다.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* 서명 정보 */}
              <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 mb-4">서명 정보</h2>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex justify-between py-1 border-b border-gray-100">
                    <span className="font-medium">서명 일시:</span>
                    <span>{dateString}</span>
                  </li>
                  <li className="flex justify-between py-1 border-b border-gray-100">
                    <span className="font-medium">서명 ID:</span>
                    <span>{signatureId}</span>
                  </li>
                  <li className="flex justify-between py-1 border-b border-gray-100">
                    <span className="font-medium">인증 방법:</span>
                    <span>PASS 인증, 신분증</span>
                  </li>
                  <li className="flex justify-between py-1">
                    <span className="font-medium">서명 문서 수:</span>
                    <span>{signedDocuments.length}개</span>
                  </li>
                </ul>
              </div>
              
              {/* PDF 다운로드 */}
              <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                <h2 className="text-lg font-medium text-gray-900 mb-4">서명 문서 다운로드</h2>
                <p className="text-sm text-gray-600 mb-4">
                  서명한 문서를 PDF 형식으로 다운로드할 수 있습니다. 다운로드할 문서를 선택하세요.
                </p>
                
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">문서 선택</span>
                    <div className="space-x-2">
                      <button 
                        onClick={() => toggleAllDocuments(true)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        모두 선택
                      </button>
                      <span className="text-gray-300">|</span>
                      <button 
                        onClick={() => toggleAllDocuments(false)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        모두 해제
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 max-h-40 overflow-y-auto p-2 bg-white rounded-md">
                    {signedDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`doc-${doc.id}`}
                          checked={selectedDocuments[doc.id] || false}
                          onChange={() => toggleDocumentSelection(doc.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`doc-${doc.id}`} className="ml-2 block text-sm text-gray-700">
                          문서 {doc.id} ({doc.signaturePositions.filter(pos => pos.signed).length}개 서명)
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button
                  onClick={downloadPdf}
                  variant="primary"
                  fullWidth
                  loading={isGeneratingPdf}
                  disabled={isGeneratingPdf || selectedCount === 0}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  }
                >
                  {isGeneratingPdf ? 'PDF 생성 중...' : `선택한 문서 다운로드 (${selectedCount}/${signedDocuments.length})`}
                </Button>
              </div>
            </div>
            
            {/* 서명 문서 미리보기 */}
            {signedDocuments.length > 0 && (
              <div className="mt-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">서명 문서 미리보기</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {signedDocuments.map((doc) => (
                    <div 
                      key={doc.id} 
                      className={`border rounded-lg overflow-hidden ${
                        selectedDocuments[doc.id] ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                      }`}
                      onClick={() => toggleDocumentSelection(doc.id)}
                    >
                      <div className="relative h-40 bg-gray-100">
                        <Image
                          src={doc.imageUrl}
                          alt={`문서 ${doc.id}`}
                          fill
                          style={{ objectFit: 'contain' }}
                        />
                      </div>
                      <div className="p-3 bg-white">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">문서 {doc.id}</span>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                            {doc.signaturePositions.filter(pos => pos.signed).length}개 서명
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-center">
            <Button 
              href="/" 
              variant="primary"
              size="lg"
            >
              홈으로 돌아가기
            </Button>
          </CardFooter>
        </Card>
      </Container>
    </div>
  );
} 