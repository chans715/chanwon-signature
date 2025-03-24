'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useError } from '@/components/ErrorHandler';
import Container from '@/components/ui/Container';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

// PDF 뷰어를 클라이언트 사이드에서만 로드하도록 설정
const PDFViewer = dynamic(() => import('@/components/PDFViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center h-[600px] bg-gray-100">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  )
});

// 사용할 샘플 문서 데이터
const initialSampleDocuments = [
  {
    id: 1,
    imageUrl: '/images/document1.jpeg',
    pdfUrl: null,
    type: 'image',
    signaturePositions: [
      { id: '1', x: 100, y: 300, width: 150, height: 60, signed: false },
      { id: '2', x: 300, y: 400, width: 150, height: 60, signed: false },
    ]
  },
  {
    id: 2,
    imageUrl: '/images/document2.jpeg',
    pdfUrl: null,
    type: 'image',
    signaturePositions: [
      { id: '1', x: 120, y: 280, width: 150, height: 60, signed: false },
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
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customSignaturePositions, setCustomSignaturePositions] = useState<Array<Array<{id: string; x: number; y: number; width: number; height: number; signed?: boolean;}>>>([]);
  const [imageErrorShown, setImageErrorShown] = useState<Record<number, boolean>>({});
  const [documents, setDocuments] = useState(initialSampleDocuments);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  
  // 페이지 로드 시 서명 상태 초기화
  useEffect(() => {
    // 서명 상태 초기화
    setSignedPositions({});
    
    // 이미지 로딩 상태 초기화
    setImageErrorShown({});

    // 실제 사용자 문서 로드 (예: DB나 스토리지에서)
    // 여기서는 샘플 데이터를 사용
    const loadUserDocuments = async () => {
      try {
        // 세션 스토리지에서 이전에 업로드한 문서가 있는지 확인
        const uploadedDocuments = sessionStorage.getItem('uploadedDocuments');
        if (uploadedDocuments) {
          const parsedDocs = JSON.parse(uploadedDocuments);
          if (Array.isArray(parsedDocs) && parsedDocs.length > 0) {
            // 업로드된 문서가 있으면 사용
            setDocuments(parsedDocs.map((doc, index) => ({
              ...doc,
              id: index + 1,
              type: 'image',
              signaturePositions: doc.signaturePositions || [
                { id: `auto-${index}-1`, x: 100, y: 300, width: 150, height: 60, signed: false }
              ]
            })));
            console.log('업로드된 문서를 로드했습니다:', parsedDocs);
          } else {
            // 업로드된 문서가 없으면 샘플 데이터 사용
            console.log('업로드된 문서가 없어 샘플 데이터를 사용합니다');
          }
        }
        
        // 이미지 로드 상태 설정
        setImagesLoaded(true);
      } catch (error) {
        console.error('문서 로드 중 오류:', error);
        addError('error', '문서를 불러오는 중 오류가 발생했습니다.', true, 5000);
      }
    };
    
    loadUserDocuments();
  }, [addError]);
  
  // 커스텀 위치 초기화
  useEffect(() => {
    if (documents.length > 0 && imagesLoaded) {
      const initialCustomPositions = documents.map(doc => [...doc.signaturePositions]);
      setCustomSignaturePositions(initialCustomPositions);
    }
  }, [documents, imagesLoaded]);
  
  // 현재 문서와 서명 위치
  const currentDocument = documents[currentDocIndex] || { 
    id: 0, 
    imageUrl: '', 
    pdfUrl: null, 
    type: 'image',
    signaturePositions: [] 
  };
  const totalDocuments = documents.length;
  
  // 현재 사용할 서명 위치 (기본 또는 커스텀)
  const currentSignaturePositions = isCustomMode && customSignaturePositions[currentDocIndex] 
    ? customSignaturePositions[currentDocIndex] 
    : currentDocument.signaturePositions || [];
  
  // 세션 스토리지에서 서명 이미지 가져오기
  useEffect(() => {
    const savedSignature = sessionStorage.getItem('userSignature');
    if (savedSignature) {
      setSignatureImage(savedSignature);
      setIsLoading(false);
    } else {
      addError('error', '저장된 서명을 찾을 수 없습니다. 서명을 다시 입력해주세요.', true, 5000);
      router.push('/signature');
    }
  }, [addError, router]);
  
  // 서명 위치에 서명 추가하기
  const addSignature = (positionId: string) => {
    console.log('서명 추가 시도:', positionId);
    
    // 세션 스토리지에서 서명 가져오기
    const signatureData = sessionStorage.getItem('userSignature');
    
    if (!signatureData) {
      console.error('세션 스토리지에서 서명 데이터를 찾을 수 없습니다.');
      addError('error', '서명 이미지를 찾을 수 없습니다. 서명 단계로 돌아가 다시 서명해주세요.', true, 5000);
      return;
    }
    
    console.log('서명 데이터 로드 성공 (길이):', signatureData.length);
    
    try {
      // 서명 위치에 서명 추가
      setSignedPositions(prev => {
        console.log('이전 서명 위치:', prev);
        const newPositions = { ...prev };
        newPositions[positionId] = true;
        console.log('새 서명 위치:', newPositions);
        return newPositions;
      });
      
      // 서명 이미지 설정
      setSignatureImage(signatureData);
      
      // 서명된 문서 상태 업데이트
      setDocuments(prev => {
        const newDocuments = [...prev];
        const docIndex = newDocuments.findIndex(doc => doc.id === currentDocIndex + 1);
        
        if (docIndex === -1) {
          // 문서가 없으면 새로 추가
          console.log('새 문서 추가:', currentDocIndex + 1);
          const newDoc = {
            id: currentDocIndex + 1,
            imageUrl: currentDocument.imageUrl,
            pdfUrl: currentDocument.pdfUrl,
            type: currentDocument.type,
            signaturePositions: currentSignaturePositions.map(pos => ({
              ...pos,
              signed: pos.id === positionId || (prev?.[docIndex]?.signaturePositions?.find(p => p.id === pos.id)?.signed ?? false)
            }))
          };
          newDocuments.push(newDoc);
          console.log('추가된 문서:', newDoc);
        } else {
          // 기존 문서 업데이트
          console.log('기존 문서 업데이트:', docIndex, currentDocIndex + 1);
          const signaturePositionsUpdate = currentSignaturePositions.map(pos => ({
            ...pos,
            signed: pos.id === positionId || (prev?.[docIndex]?.signaturePositions?.find(p => p.id === pos.id)?.signed ?? false)
          }));
          newDocuments[docIndex] = {
            ...newDocuments[docIndex],
            signaturePositions: signaturePositionsUpdate
          };
          console.log('업데이트된 문서 서명 위치:', signaturePositionsUpdate);
        }
        
        // 서명된 문서 정보를 세션 스토리지에 저장
        try {
          const serializedData = JSON.stringify(newDocuments);
          sessionStorage.setItem('signedDocuments', serializedData);
          console.log('세션 스토리지에 문서 저장 성공 (데이터 길이):', serializedData.length);
        } catch (storageError) {
          console.error('세션 스토리지 저장 오류:', storageError);
        }
        
        return newDocuments;
      });
      
      addError('success', '서명이 추가되었습니다.', true, 2000);
    } catch (error) {
      console.error('서명 추가 중 오류:', error);
      addError('error', '서명 추가 중 오류가 발생했습니다.', true, 3000);
    }
  };
  
  // 현재 문서의 모든 위치에 서명이 되었는지 확인
  const isCurrentDocumentFullySigned = () => {
    if (currentSignaturePositions.length === 0) {
      return true; // 서명 위치가 없으면 이미 완료된 것으로 간주
    }
    return currentSignaturePositions.every(pos => signedPositions[pos.id]);
  };
  
  // 문서에 클릭하여 서명 위치 추가
  const handleDocumentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCustomMode) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const width = 150;
    const height = 60;
    
    // 새 서명 위치 ID 생성
    const newPositionId = `custom-${currentDocIndex}-${Date.now()}`;
    
    // 현재 문서의 커스텀 서명 위치 복사
    const updatedPositions = [...customSignaturePositions];
    if (!updatedPositions[currentDocIndex]) {
      updatedPositions[currentDocIndex] = [];
    }
    
    // 새 서명 위치 추가
    updatedPositions[currentDocIndex].push({
      id: newPositionId,
      x,
      y,
      width,
      height
    });
    
    setCustomSignaturePositions(updatedPositions);
    addError('success', '서명 위치가 추가되었습니다.', true, 2000);
  };
  
  // 서명 위치 삭제
  const removeSignaturePosition = (positionId: string) => {
    const updatedPositions = [...customSignaturePositions];
    updatedPositions[currentDocIndex] = updatedPositions[currentDocIndex].filter(
      pos => pos.id !== positionId
    );
    setCustomSignaturePositions(updatedPositions);
    
    // 관련 서명도 삭제
    if (signedPositions[positionId]) {
      const updatedSignedPositions = { ...signedPositions };
      delete updatedSignedPositions[positionId];
      setSignedPositions(updatedSignedPositions);
    }
    
    addError('info', '서명 위치가 삭제되었습니다.', true, 2000);
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
      
      // 서명된 문서 정보 저장 (커스텀 위치 포함)
      const signedDocuments = documents.map((doc, idx) => ({
        id: doc.id,
        imageUrl: doc.imageUrl,
        pdfUrl: doc.pdfUrl,
        type: doc.type,
        signaturePositions: (isCustomMode ? customSignaturePositions[idx] : doc.signaturePositions).map(pos => ({
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
    return documents.every((doc, idx) => {
      const positions = isCustomMode ? customSignaturePositions[idx] : doc.signaturePositions;
      return positions.length === 0 || positions.every(pos => signedPositions[pos.id]);
    });
  };
  
  // 커스텀 모드 전환
  const toggleCustomMode = () => {
    setIsCustomMode(prev => !prev);
    addError('info', isCustomMode ? '기본 서명 모드로 전환합니다.' : '커스텀 서명 모드로 전환합니다. 문서를 클릭하여 서명 위치를 추가하세요.', true, 3000);
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
            {/* 모드 전환 버튼 */}
            <div className="mb-4 flex justify-end">
              <Button
                onClick={toggleCustomMode}
                variant="secondary"
                size="sm"
              >
                {isCustomMode ? '기본 서명 모드' : '직접 서명 위치 지정'}
              </Button>
            </div>
            
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
                    {isCustomMode 
                      ? '문서를 클릭하여 서명 위치를 직접 지정하세요. 위치 지정 후 \'서명등록\' 버튼을 클릭해주세요.' 
                      : '해당 문서를 읽어보시고, 밑에 서명등록 버튼을 클릭해주세요.'}
                  </p>
                </div>
              </div>
            </div>
            
            <div 
              className="relative border border-gray-300 rounded-md mb-6 overflow-hidden"
              onClick={isCustomMode ? handleDocumentClick : undefined}
              style={{ cursor: isCustomMode ? 'crosshair' : 'default' }}
            >
              {/* 문서 표시 (이미지 또는 PDF) */}
              {currentDocument.type === 'image' ? (
                <div className="relative w-full h-[600px]">
                  {currentDocument.imageUrl && (
                    <div className="w-full h-full flex items-center justify-center">
                      <img 
                        src={`${currentDocument.imageUrl}`}
                        alt={`문서 ${currentDocIndex + 1}`}
                        style={{ 
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain'
                        }}
                        className="bg-white"
                        onLoad={() => {
                          console.log('이미지 로드 성공:', currentDocument.imageUrl);
                        }}
                        onError={(e) => {
                          console.error('이미지 로드 실패:', currentDocument.imageUrl);
                          
                          // 오류 메시지를 한 번만 표시하기 위한 체크
                          if (!imageErrorShown[currentDocIndex]) {
                            addError('error', `이미지를 불러올 수 없습니다: ${currentDocument.imageUrl}`, true, 5000);
                            setImageErrorShown(prev => ({
                              ...prev,
                              [currentDocIndex]: true
                            }));
                            
                            // 이미지 경로 디버깅 정보 출력
                            console.log('이미지 경로 정보:');
                            console.log('기본 경로:', currentDocument.imageUrl);
                            console.log('절대 경로:', `${window.location.origin}${currentDocument.imageUrl}`);
                            console.log('기본 URL:', window.location.origin);
                          }
                          
                          // 다른 경로 시도 (window.location.origin 없이)
                          e.currentTarget.src = currentDocument.imageUrl;
                          
                          // 두 번째 시도도 실패하면 빈 이미지로 대체
                          e.currentTarget.onerror = () => {
                            e.currentTarget.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
                            e.currentTarget.onerror = null; // 무한 루프 방지
                          };
                        }}
                      />
                    </div>
                  )}
                  
                  {/* 서명 위치 표시 */}
                  {currentSignaturePositions.map((position) => (
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
                      onClick={(e) => {
                        if (isCustomMode) {
                          e.stopPropagation();
                          removeSignaturePosition(position.id);
                        }
                      }}
                    >
                      {signedPositions[position.id] ? (
                        <img 
                          src={signatureImage || ''} 
                          alt="서명" 
                          style={{ 
                            width: `${position.width - 10}px`,
                            height: `${position.height - 10}px`,
                            objectFit: 'contain',
                            background: 'transparent'
                          }}
                        />
                      ) : (
                        <div className="relative w-full h-full flex items-center justify-center">
                          <span className="text-xs text-red-500 font-medium">서명 필요</span>
                          {isCustomMode && (
                            <button 
                              className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeSignaturePosition(position.id);
                              }}
                            >
                              ×
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="relative w-full h-[600px]">
                  {currentDocument.pdfUrl && (
                    <PDFViewer pdfUrl={currentDocument.pdfUrl} />
                  )}
                  
                  {/* PDF에도 서명 위치 표시 */}
                  {currentSignaturePositions.map((position) => (
                    <div
                      key={position.id}
                      className={`absolute border-2 ${
                        signedPositions[position.id] ? 'border-green-500 bg-green-50' : 'border-red-500 animate-pulse'
                      } rounded-md flex items-center justify-center z-10`}
                      style={{
                        left: `${position.x}px`,
                        top: `${position.y}px`,
                        width: `${position.width}px`,
                        height: `${position.height}px`,
                      }}
                      onClick={(e) => {
                        if (isCustomMode) {
                          e.stopPropagation();
                          removeSignaturePosition(position.id);
                        }
                      }}
                    >
                      {signedPositions[position.id] ? (
                        <img 
                          src={signatureImage || ''} 
                          alt="서명" 
                          style={{ 
                            width: `${position.width - 10}px`,
                            height: `${position.height - 10}px`,
                            objectFit: 'contain',
                            background: 'transparent'
                          }}
                        />
                      ) : (
                        <div className="relative w-full h-full flex items-center justify-center">
                          <span className="text-xs text-red-500 font-medium">서명 필요</span>
                          {isCustomMode && (
                            <button 
                              className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeSignaturePosition(position.id);
                              }}
                            >
                              ×
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* 서명 버튼 */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">서명 추가하기</h3>
              {currentSignaturePositions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {currentSignaturePositions.map((position, index) => (
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
              ) : isCustomMode ? (
                <p className="text-gray-500 text-sm">문서를 클릭하여 서명 위치를 추가해주세요.</p>
              ) : (
                <p className="text-gray-500 text-sm">이 문서에는 서명 위치가 지정되어 있지 않습니다. '직접 서명 위치 지정' 버튼을 클릭하여 서명 위치를 추가하세요.</p>
              )}
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
                <Link href="/signature">
                  <Button 
                    variant="outline"
                  >
                    서명 다시하기
                  </Button>
                </Link>
              )}
              
              <Button
                onClick={goToNextDocument}
                variant="primary"
                disabled={!isCurrentDocumentFullySigned()}
              >
                {currentDocIndex < totalDocuments - 1 ? '다음 문서' : '서명 완료'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
} 