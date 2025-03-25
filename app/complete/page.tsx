'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Container from '@/components/ui/Container';
import Card, { CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useError } from '@/components/ErrorHandler';
import { useRouter } from 'next/navigation';

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

// ErrorContextType 인터페이스 확장
interface ExtendedErrorContextType {
  addError: (type: string, message: string, dismissable?: boolean, timeout?: number) => void;
  setError: (message: string) => void;
  setSuccess: (message: string) => void;
}

export default function Complete() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { addError } = useError();
  const [dateString, setDateString] = useState('');
  const [signatureId, setSignatureId] = useState('');
  const [documentsCount, setDocumentsCount] = useState(0);
  const [selectedDocuments, setSelectedDocuments] = useState<Record<number, boolean>>({});
  const [signedDocuments, setSignedDocuments] = useState<any[]>([]);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const router = useRouter();

  // 성공/오류 메시지 처리 함수
  const setError = (message: string) => {
    addError('error', message, true, 5000);
  };

  const setSuccess = (message: string) => {
    addError('success', message, true, 3000);
  };

  useEffect(() => {
    // 세션 스토리지에서 서명된 문서 정보 가져오기
    const savedDocuments = sessionStorage.getItem('signedDocuments');
    if (savedDocuments) {
      try {
        const parsedDocuments = JSON.parse(savedDocuments);
        if (Array.isArray(parsedDocuments) && parsedDocuments.length > 0) {
          console.log('세션 스토리지에서 서명된 문서를 로드했습니다:', parsedDocuments);
          setSignedDocuments(parsedDocuments);
          
          // 모든 문서 선택 상태로 초기화
          const initialSelections: Record<number, boolean> = {};
          parsedDocuments.forEach((doc: any) => {
            initialSelections[doc.id] = true;
          });
          setSelectedDocuments(initialSelections);
        } else {
          console.warn('세션 스토리지에 유효한 문서 데이터가 없습니다.');
          addError('warning', '서명된 문서 정보가 없습니다. 샘플 데이터를 표시합니다.', true, 5000);
          
          // 샘플 데이터 표시
          const sampleData = [
            {
              id: 1,
              imageUrl: '/images/document1.jpeg',
              pdfUrl: null,
              type: 'image',
              signaturePositions: [
                { id: '1', x: 100, y: 300, width: 150, height: 60, signed: true }
              ]
            }
          ];
          setSignedDocuments(sampleData);
          
          // 샘플 데이터 선택 상태 초기화
          setSelectedDocuments({ 1: true });
        }
      } catch (error) {
        console.error('서명 문서 데이터 파싱 오류:', error);
        addError('error', '서명된 문서 정보를 불러오는데 실패했습니다.', true, 5000);
      }
    } else {
      console.warn('세션 스토리지에 서명된 문서 정보가 없습니다.');
      // 서명된 문서가 없는 경우 처리
    }
    
    // 서명 ID 생성
    const signatureId = `SIG-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    setSignatureId(signatureId);
    
    // 현재 날짜 및 시간
    const now = new Date();
    setDateString(now.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }));
  }, [addError]);

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

  // 간소화된 문서 다운로드 처리 함수
  const handleDownload = (docId: number) => {
    try {
      // 로컬 스토리지에서 서명된 문서 정보 가져오기
      const storedDocuments = localStorage.getItem('signedDocumentsForDownload');
      const signature = localStorage.getItem('userSignatureForDownload');
      
      if (!storedDocuments) {
        console.error('저장된 문서 정보를 찾을 수 없습니다.');
        setError('저장된 문서 정보를 찾을 수 없습니다.');
        return;
      }
      
      const parsedDocuments = JSON.parse(storedDocuments);
      
      // 다운로드할 문서 찾기
      const documentToDownload = parsedDocuments.find((doc: any) => doc.id === docId);
      
      if (!documentToDownload) {
        console.error(`ID ${docId}의 문서를 찾을 수 없습니다.`);
        setError(`다운로드할 문서를 찾을 수 없습니다 (ID: ${docId}).`);
        return;
      }
      
      // 서명된 문서의 이미지 URL 가져오기
      const imageUrl = documentToDownload.imageUrl;
      
      if (!imageUrl) {
        console.error('문서 이미지 URL이 없습니다.');
        setError('문서 이미지를 찾을 수 없습니다.');
        return;
      }
      
      // 새 캔버스 생성
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        console.error('캔버스 컨텍스트를 생성할 수 없습니다.');
        setError('문서 이미지를 처리할 수 없습니다.');
        return;
      }
      
      // 문서 이미지 로드
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        // 캔버스 크기 설정
        canvas.width = img.width;
        canvas.height = img.height;
        
        // 문서 이미지 그리기
        ctx.drawImage(img, 0, 0);
        
        // 서명 위치가 있는 경우 서명 추가
        if (documentToDownload.signaturePositions && documentToDownload.signaturePositions.length > 0) {
          // 서명된 위치에만 서명 추가
          const signedPositions = documentToDownload.signaturePositions.filter(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (pos: any) => pos.signed
          );
          
          if (signedPositions.length > 0) {
            // 각 서명 위치에 서명 이미지 그리기
            let positionsProcessed = 0;
            const totalPositions = signedPositions.length;
            
            signedPositions.forEach((position: any) => {
              // 서명 이미지 소스 (위치별 서명 이미지 또는 전체 서명 이미지)
              const signatureSource = position.signatureImage || signature || documentToDownload.signatureImage;
              
              if (signatureSource) {
                const signatureImg = new window.Image();
                signatureImg.crossOrigin = 'anonymous';
                
                signatureImg.onload = () => {
                  // 서명 위치에 서명 이미지 추가
                  ctx.drawImage(
                    signatureImg,
                    position.x,
                    position.y,
                    position.width,
                    position.height
                  );
                  
                  positionsProcessed++;
                  
                  // 모든 서명 위치 처리 완료 후 다운로드
                  if (positionsProcessed === totalPositions) {
                    finalizeDownload(canvas, docId);
                  }
                };
                
                signatureImg.onerror = () => {
                  console.error('서명 이미지 로드 실패');
                  positionsProcessed++;
                  
                  // 서명 이미지 로드 실패해도 다운로드 진행
                  if (positionsProcessed === totalPositions) {
                    finalizeDownload(canvas, docId);
                  }
                };
                
                // 서명 이미지 로드
                signatureImg.src = signatureSource;
              } else {
                positionsProcessed++;
                
                // 서명 이미지가 없어도 다운로드 진행
                if (positionsProcessed === totalPositions) {
                  finalizeDownload(canvas, docId);
                }
              }
            });
          } else {
            // 서명된 위치가 없으면 바로 다운로드
            finalizeDownload(canvas, docId);
          }
        } else {
          // 서명 위치가 없으면 바로 다운로드
          finalizeDownload(canvas, docId);
        }
      };
      
      img.onerror = () => {
        console.error('문서 이미지 로드 실패');
        setError('문서 이미지를 로드할 수 없습니다.');
        
        // 이미지 로드 실패시 다른 방법으로 시도 (상대 경로)
        const relativeUrl = imageUrl.startsWith('/') 
          ? window.location.origin + imageUrl 
          : imageUrl;
        
        img.src = relativeUrl;
      };
      
      // 이미지 로드 시작
      img.src = imageUrl;
    } catch (error) {
      console.error('문서 다운로드 중 오류:', error);
      setError('문서 다운로드 중 오류가 발생했습니다.');
    }
  };

  // 최종 다운로드 처리 함수
  const finalizeDownload = (canvas: HTMLCanvasElement, downloadDocId: number) => {
    try {
      // 캔버스를 이미지로 변환
      const signedImageUrl = canvas.toDataURL('image/jpeg', 0.95);
      
      // 다운로드 링크 생성
      const downloadLink = document.createElement('a');
      downloadLink.href = signedImageUrl;
      downloadLink.download = `서명문서_${downloadDocId}_${new Date().toISOString().slice(0, 10)}.jpg`;
      
      // 다운로드 트리거
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // 다운로드 성공 메시지
      setSuccess(`문서 ${downloadDocId}가 성공적으로 다운로드되었습니다.`);
    } catch (error) {
      console.error('최종 다운로드 처리 중 오류:', error);
      setError('문서 이미지 생성 중 오류가 발생했습니다.');
    }
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
                          문서 {doc.id} ({doc.signaturePositions.filter((pos: any) => pos.signed).length}개 서명)
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button
                  onClick={() => selectedCount > 0 && handleDownload(signedDocuments[0].id)}
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
                        <img
                          src={doc.imageUrl}
                          alt={`문서 ${doc.id}`}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'contain'
                          }}
                          onLoad={() => {
                            console.log('미리보기 이미지 로드 성공:', doc.imageUrl);
                          }}
                          onError={(e) => {
                            console.error('미리보기 이미지 로드 실패:', doc.imageUrl);
                            console.log('미리보기 이미지 경로 정보:');
                            console.log('기본 경로:', doc.imageUrl);
                            console.log('절대 경로 시도:', `${window.location.origin}${doc.imageUrl}`);
                            
                            // 다른 경로 시도
                            e.currentTarget.src = doc.imageUrl;
                            
                            // 두 번째 시도도 실패하면 빈 이미지로 대체
                            e.currentTarget.onerror = () => {
                              e.currentTarget.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
                              e.currentTarget.onerror = null; // 무한 루프 방지
                            };
                          }}
                        />
                      </div>
                      <div className="p-3 bg-white">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">문서 {doc.id}</span>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                            {doc.signaturePositions?.filter((pos: any) => pos.signed).length || 0}개 서명
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