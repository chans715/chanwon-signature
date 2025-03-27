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
  displayX?: number;
  displayY?: number;
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
    // 세션 스토리지에서 서명 및 날짜 정보 가져오기
    const dateStr = sessionStorage.getItem('documentsSignedDate');
    if (dateStr) {
      const date = new Date(dateStr);
      setDateString(date.toLocaleDateString('ko-KR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }));
    }
    
    // 서명 ID 가져오기
    const sigId = sessionStorage.getItem('signatureId');
    if (sigId) {
      setSignatureId(sigId);
    }
    
    // 서명된 문서 정보 가져오기 (세션 스토리지에서도 시도)
    let storedDocuments = localStorage.getItem('signedDocumentsForDownload');
    if (!storedDocuments) {
      // 로컬 스토리지에 없으면 세션 스토리지에서 시도
      storedDocuments = sessionStorage.getItem('signedDocumentsForDownload');
      if (storedDocuments) {
        console.log('로컬 스토리지에 문서 정보가 없어 세션 스토리지에서 복원했습니다.');
        try {
          // 세션 스토리지의 데이터를 로컬 스토리지에 백업
          localStorage.setItem('signedDocumentsForDownload', storedDocuments);
        } catch (e) {
          console.error('로컬 스토리지 저장 실패:', e);
        }
      }
    }
    
    if (storedDocuments) {
      try {
        const parsedDocuments = JSON.parse(storedDocuments);
        console.log('문서 데이터 로드됨:', parsedDocuments.length);
        
        // 서명 데이터 검증
        parsedDocuments.forEach((doc: any, index: number) => {
          console.log(`문서 ${index + 1} (ID: ${doc.id}) 정보:`, {
            signaturePositionsCount: doc.signaturePositions?.length || 0,
            signedCount: doc.signaturePositions?.filter((p: any) => p.signed).length || 0,
            imageUrl: doc.imageUrl
          });
        });
        
        setSignedDocuments(parsedDocuments);
        
        // 모든 문서가 기본적으로 선택된 상태로 설정
        const selectedState: Record<number, boolean> = {};
        parsedDocuments.forEach((doc: any) => {
          selectedState[doc.id] = true;
        });
        setSelectedDocuments(selectedState);
        
        // 서명된 문서 미리보기 렌더링
        setTimeout(() => {
          parsedDocuments.forEach((doc: any) => {
            renderSignedDocumentPreview(doc.id);
          });
        }, 500);
      } catch (error) {
        console.error('서명된 문서 정보 파싱 오류:', error);
      }
    } else {
      console.error('저장된 서명 문서 정보를 찾을 수 없습니다.');
    }
    
    // 서명 이미지 확인
    const signature = localStorage.getItem('userSignatureForDownload');
    if (!signature) {
      const sessionSignature = sessionStorage.getItem('userSignature');
      if (sessionSignature) {
        console.log('로컬 스토리지에 서명 이미지가 없어 세션 스토리지에서 복원했습니다.');
        try {
          localStorage.setItem('userSignatureForDownload', sessionSignature);
        } catch (e) {
          console.error('로컬 스토리지 서명 저장 실패:', e);
        }
      } else {
        console.error('서명 이미지를 찾을 수 없습니다.');
      }
    } else {
      console.log('서명 이미지 로드됨: 길이', signature.length);
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

  // 서명된 문서 미리보기 렌더링 함수 개선
  const renderSignedDocumentPreview = (docId: number) => {
    try {
      console.log(`[시작] 문서 ID:${docId} 미리보기 렌더링 시작`);
      
      // 로컬 스토리지에서 서명된 문서 정보 가져오기
      const storedDocuments = localStorage.getItem('signedDocumentsForDownload');
      const signature = localStorage.getItem('userSignatureForDownload');
      
      if (!storedDocuments || !signature) {
        console.error('저장된 문서 정보나 서명을 찾을 수 없습니다.', {storedDocuments: !!storedDocuments, signature: !!signature});
        setError('서명된 문서 정보나 서명을 찾을 수 없습니다.');
        return;
      }
      
      // 문서 정보 파싱
      const documents = JSON.parse(storedDocuments);
      const document = documents.find((d: any) => d.id === docId);
      
      if (!document) {
        console.error(`ID가 ${docId}인 문서를 찾을 수 없습니다.`);
        setError(`ID가 ${docId}인 문서를 찾을 수 없습니다.`);
        return;
      }
      
      console.log(`문서 정보:`, document);
      
      // 미리보기 컨테이너와 이미지 요소 찾기
      const previewContainer = window.document.getElementById(`preview-container-${docId}`);
      const previewImg = window.document.getElementById(`preview-image-${docId}`) as HTMLImageElement;
      
      if (!previewContainer || !previewImg) {
        console.error('미리보기 요소를 찾을 수 없습니다.', {
          containerId: `preview-container-${docId}`,
          imgId: `preview-image-${docId}`,
          containerExists: !!previewContainer,
          imgExists: !!previewImg
        });
        setError('미리보기 요소를 찾을 수 없습니다.');
        return;
      }
      
      console.log(`문서 ID:${docId} - 서명 위치 수: ${document.signaturePositions?.length || 0}`);
      
      // 원본 이미지 로드
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.src = document.imageUrl;
      
      // 이미지 로드 완료 후 처리
      img.onload = () => {
        console.log(`원본 이미지 로드 성공 (문서 ID:${docId}): ${img.naturalWidth}x${img.naturalHeight}`);
        
        // 원본 이미지의 실제 크기
        const naturalWidth = img.naturalWidth || document.naturalWidth || 800;
        const naturalHeight = img.naturalHeight || document.naturalHeight || 1000;
        
        console.log(`이미지 크기 확인: 이미지 객체=${img.naturalWidth}x${img.naturalHeight}, 문서 데이터=${document.naturalWidth}x${document.naturalHeight}`);
        
        // 캔버스 생성 및 크기 설정 (원본 이미지 크기로 설정)
        const canvas = window.document.createElement('canvas');
        canvas.width = naturalWidth;
        canvas.height = naturalHeight;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          console.error('캔버스 컨텍스트를 생성할 수 없습니다.');
          setError('캔버스 컨텍스트를 생성할 수 없습니다.');
          return;
        }
        
        // 배경 색상 설정 (투명하게)
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, naturalWidth, naturalHeight);
        
        // 원본 이미지를 캔버스에 그리기
        ctx.drawImage(img, 0, 0, naturalWidth, naturalHeight);
        
        // 서명된 위치가 있는지 확인
        const signedPositions = document.signaturePositions?.filter((p: any) => p.signed) || [];
        console.log(`서명된 위치 발견: ${signedPositions.length}개`, signedPositions);
        
        if (signedPositions.length > 0) {
          // 서명 이미지 로드
          const sigImg = new window.Image();
          sigImg.crossOrigin = 'anonymous';
          sigImg.src = signature;
          
          sigImg.onload = () => {
            console.log('서명 이미지 로드 성공:', {
              width: sigImg.width,
              height: sigImg.height
            });
            
            // 서명된 각 위치에 서명 이미지 그리기
            signedPositions.forEach((position: any, index: number) => {
              try {
                console.log(`서명 위치 ${index + 1}/${signedPositions.length} 처리 중:`, position);
                
                // 서명 이미지를 해당 위치에 그리기
                ctx.drawImage(
                  sigImg, 
                  position.x, 
                  position.y, 
                  position.width, 
                  position.height
                );
                
                console.log(`서명 위치 ${index + 1} 그리기 완료`);
              } catch (drawErr) {
                console.error(`서명 이미지 그리기 실패 (위치 ${index + 1}):`, drawErr);
              }
            });
            
            // 완성된 캔버스 이미지를 미리보기에 반영
            const dataUrl = canvas.toDataURL('image/png');
            previewImg.src = dataUrl;
            
            // 캔버스 이미지를 가지고 있기 (다운로드용)
            previewImg.dataset.signedImage = dataUrl;
            
            console.log(`문서 ID:${docId} 미리보기 렌더링 완료`);
            setSuccess(`문서 ID:${docId} 미리보기 생성 완료`);
          };
          
          sigImg.onerror = (error) => {
            console.error('서명 이미지 로드 실패:', error);
            setError('서명 이미지를 로드할 수 없습니다.');
            
            // 서명 없이 원본 이미지만 표시
            const dataUrl = canvas.toDataURL('image/png');
            previewImg.src = dataUrl;
            previewImg.dataset.signedImage = dataUrl;
          };
        } else {
          console.log('서명된 위치가 없습니다. 원본 이미지만 표시합니다.');
          
          // 서명 없이 원본 이미지만 표시
          const dataUrl = canvas.toDataURL('image/png');
          previewImg.src = dataUrl;
          previewImg.dataset.signedImage = dataUrl;
        }
      };
      
      img.onerror = (error) => {
        console.error('원본 이미지 로드 실패:', error, document.imageUrl);
        setError('원본 이미지를 로드할 수 없습니다.');
        
        // 에러 발생 시 빈 이미지 표시
        previewImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
      };
    } catch (error) {
      console.error('미리보기 렌더링 중 오류 발생:', error);
      setError('미리보기 렌더링 중 오류가 발생했습니다.');
    }
  };

  // 단일 문서 다운로드 함수 개선
  const downloadSingleDocument = (docId: number) => {
    try {
      console.log(`[시작] 문서 ID:${docId} 다운로드`);
      
      // 로컬 스토리지에서 서명된 문서 정보 가져오기
      const storedDocuments = localStorage.getItem('signedDocumentsForDownload');
      const signature = localStorage.getItem('userSignatureForDownload');
      
      if (!storedDocuments || !signature) {
        console.error('저장된 문서 정보나 서명을 찾을 수 없습니다.');
        setError('저장된 문서 정보나 서명을 찾을 수 없습니다.');
        return;
      }
      
      // 문서 정보 파싱
      const documents = JSON.parse(storedDocuments);
      const document = documents.find((d: any) => d.id === docId);
      
      if (!document) {
        console.error(`ID가 ${docId}인 문서를 찾을 수 없습니다.`);
        setError(`ID가 ${docId}인 문서를 찾을 수 없습니다.`);
        return;
      }
      
      // 이미 캔버스에 렌더링된 서명 이미지가 있는지 확인
      const previewImg = window.document.getElementById(`preview-image-${docId}`) as HTMLImageElement;
      
      if (previewImg && previewImg.dataset.signedImage) {
        console.log('이미 렌더링된 서명 이미지 사용:', previewImg.dataset.signedImage.substring(0, 50) + '...');
        
        // 렌더링된 이미지 다운로드
        const link = window.document.createElement('a');
        link.href = previewImg.dataset.signedImage;
        link.download = `서명_문서_${docId}.png`;
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
        
        setSuccess(`문서 ID:${docId} 다운로드 완료`);
        return;
      }
      
      console.log('캐시된 이미지 없음, 새로 렌더링 시작');
      
      // 원본 이미지 로드
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.src = document.imageUrl;
      
      img.onload = () => {
        console.log(`원본 이미지 로드 성공: ${img.naturalWidth}x${img.naturalHeight}`);
        
        // 원본 이미지의 실제 크기
        const naturalWidth = img.naturalWidth || document.naturalWidth || 800;
        const naturalHeight = img.naturalHeight || document.naturalHeight || 1000;
        
        // 캔버스 생성 및 크기 설정
        const canvas = window.document.createElement('canvas');
        canvas.width = naturalWidth;
        canvas.height = naturalHeight;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          console.error('캔버스 컨텍스트를 생성할 수 없습니다.');
          setError('캔버스 컨텍스트를 생성할 수 없습니다.');
          return;
        }
        
        // 배경 색상 설정 (흰색)
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, naturalWidth, naturalHeight);
        
        // 원본 이미지를 캔버스에 그리기
        ctx.drawImage(img, 0, 0, naturalWidth, naturalHeight);
        
        // 서명된 위치가 있는지 확인
        const signedPositions = document.signaturePositions?.filter((p: any) => p.signed) || [];
        
        if (signedPositions.length > 0) {
          console.log(`서명된 위치 발견: ${signedPositions.length}개`, signedPositions);
          
          // 서명 이미지 로드
          const sigImg = new window.Image();
          sigImg.crossOrigin = 'anonymous';
          sigImg.src = signature;
          
          sigImg.onload = () => {
            console.log('서명 이미지 로드 성공:', sigImg.width, sigImg.height);
            
            // 서명된 각 위치에 서명 이미지 그리기
            signedPositions.forEach((position: any, index: number) => {
              try {
                console.log(`서명 위치 ${index + 1} 처리:`, position);
                
                // 서명 이미지를 해당 위치에 그리기
                ctx.drawImage(
                  sigImg, 
                  position.x, 
                  position.y, 
                  position.width, 
                  position.height
                );
                
                console.log(`서명 위치 ${index + 1} 그리기 완료`);
              } catch (drawErr) {
                console.error(`서명 이미지 그리기 실패 (위치 ${index + 1}):`, drawErr);
              }
            });
            
            // 완성된 캔버스 이미지 다운로드
            const dataUrl = canvas.toDataURL('image/png');
            
            const link = window.document.createElement('a');
            link.href = dataUrl;
            link.download = `서명_문서_${docId}.png`;
            window.document.body.appendChild(link);
            link.click();
            window.document.body.removeChild(link);
            
            console.log(`문서 ID:${docId} 다운로드 완료`);
            setSuccess(`문서 ID:${docId} 다운로드 완료`);
          };
          
          sigImg.onerror = (error) => {
            console.error('서명 이미지 로드 실패:', error);
            setError('서명 이미지를 로드할 수 없습니다.');
            
            // 서명 없이 원본 이미지만 다운로드
            const dataUrl = canvas.toDataURL('image/png');
            
            const link = window.document.createElement('a');
            link.href = dataUrl;
            link.download = `원본_문서_${docId}.png`;
            window.document.body.appendChild(link);
            link.click();
            window.document.body.removeChild(link);
          };
        } else {
          console.log('서명된 위치가 없습니다. 원본 이미지만 다운로드합니다.');
          
          // 서명 없이 원본 이미지만 다운로드
          const dataUrl = canvas.toDataURL('image/png');
          
          const link = window.document.createElement('a');
          link.href = dataUrl;
          link.download = `원본_문서_${docId}.png`;
          window.document.body.appendChild(link);
          link.click();
          window.document.body.removeChild(link);
        }
      };
      
      img.onerror = (error) => {
        console.error('원본 이미지 로드 실패:', error);
        setError('원본 이미지를 로드할 수 없습니다.');
      };
    } catch (error) {
      console.error('다운로드 중 오류 발생:', error);
      setError('다운로드 중 오류가 발생했습니다.');
    }
  };

  // 서명된 문서를 일괄 다운로드하는 함수 개선
  const handleDownloadAllAsJpeg = () => {
    const selectedDocIds = Object.entries(selectedDocuments)
      .filter(([_, selected]) => selected)
      .map(([id]) => Number(id));
    
    if (selectedDocIds.length === 0) {
      setError('다운로드할 문서를 선택해주세요.');
      return;
    }
    
    setIsGeneratingPdf(true);
    console.log(`${selectedDocIds.length}개 문서 다운로드 시작...`);
    
    // JSZip 라이브러리 동적 로드 (타입 명시)
    import('jszip').then((JSZipModule: any) => {
      const JSZip = JSZipModule.default;
      const zip = new JSZip();
      let completedCount = 0;
      
      // 각 선택된 문서를 처리
      selectedDocIds.forEach(docId => {
        try {
          // 로컬 스토리지에서 서명된 문서 정보 가져오기
          const storedDocuments = localStorage.getItem('signedDocumentsForDownload');
          const signature = localStorage.getItem('userSignatureForDownload');
          
          if (!storedDocuments || !signature) {
            console.error('저장된 문서 정보나 서명을 찾을 수 없습니다.');
            completedCount++;
            return;
          }
          
          // 문서 정보 파싱
          const documents = JSON.parse(storedDocuments);
          const document = documents.find((d: any) => d.id === docId);
          
          if (!document) {
            console.error(`ID가 ${docId}인 문서를 찾을 수 없습니다.`);
            completedCount++;
            return;
          }
          
          console.log(`문서 ID:${docId} 압축 파일 추가 처리 중...`, document);
          
          // 이미 캔버스에 렌더링된 서명 이미지가 있는지 확인
          const previewImg = window.document.getElementById(`preview-image-${docId}`) as HTMLImageElement;
          
          if (previewImg && previewImg.dataset.signedImage) {
            console.log('이미 렌더링된 서명 이미지 사용');
            
            // 데이터 URL에서 Base64 부분 추출
            const base64Data = previewImg.dataset.signedImage.split(',')[1];
            
            // 압축 파일에 추가
            zip.file(`서명_문서_${docId}.png`, base64Data, { base64: true });
            console.log(`문서 ID:${docId} 압축 파일에 추가 완료 (캐시 사용)`);
            
            completedCount++;
            console.log(`처리 완료: ${completedCount}/${selectedDocIds.length}`);
            
            // 모든 문서 처리 완료 시 압축 파일 다운로드
            if (completedCount === selectedDocIds.length) {
              finishZipDownload();
            }
            
            return;
          }
          
          // 원본 이미지 로드
          const img = new window.Image();
          img.crossOrigin = 'anonymous';
          img.src = document.imageUrl;
          
          // 이미지 로드 완료 후 처리
          img.onload = () => {
            console.log(`문서 ID:${docId} 원본 이미지 로드 성공`);
            
            // 원본 이미지의 실제 크기
            const naturalWidth = img.naturalWidth || document.naturalWidth || 800;
            const naturalHeight = img.naturalHeight || document.naturalHeight || 1000;
            
            const canvas = window.document.createElement('canvas');
            canvas.width = naturalWidth;
            canvas.height = naturalHeight;
            
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              console.error('캔버스 컨텍스트를 생성할 수 없습니다.');
              completedCount++;
              
              if (completedCount === selectedDocIds.length) {
                finishZipDownload();
              }
              
              return;
            }
            
            // 배경 색상 설정 (흰색)
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, naturalWidth, naturalHeight);
            
            // 원본 이미지 그리기
            ctx.drawImage(img, 0, 0, naturalWidth, naturalHeight);
            
            // 서명된 위치가 있는지 확인
            const signedPositions = document.signaturePositions?.filter((p: any) => p.signed) || [];
            console.log(`문서 ID:${docId}의 서명된 위치 수: ${signedPositions.length}`, signedPositions);
            
            if (signedPositions.length > 0) {
              // 서명 이미지 로드
              const sigImg = new window.Image();
              sigImg.crossOrigin = 'anonymous';
              sigImg.src = signature;
              
              sigImg.onload = () => {
                console.log('서명 이미지 로드 성공:', sigImg.width, sigImg.height);
                
                // 서명된 각 위치에 서명 이미지 그리기
                signedPositions.forEach((position: any, index: number) => {
                  try {
                    console.log(`서명 위치 ${index + 1} 처리 중:`, position);
                    
                    // 서명 이미지를 해당 위치에 그리기
                    ctx.drawImage(
                      sigImg, 
                      position.x, 
                      position.y, 
                      position.width, 
                      position.height
                    );
                    
                    console.log(`서명 위치 ${index + 1} 그리기 완료`);
                  } catch (drawErr) {
                    console.error(`서명 이미지 그리기 실패 (위치 ${index + 1}):`, drawErr);
                  }
                });
                
                // 캔버스 이미지를 데이터 URL로 변환
                const dataUrl = canvas.toDataURL('image/png');
                const base64Data = dataUrl.split(',')[1];
                
                // 압축 파일에 추가
                zip.file(`서명_문서_${docId}.png`, base64Data, { base64: true });
                console.log(`문서 ID:${docId} 압축 파일에 추가 완료`);
                
                completedCount++;
                console.log(`처리 완료: ${completedCount}/${selectedDocIds.length}`);
                
                // 모든 문서 처리 완료 시 압축 파일 다운로드
                if (completedCount === selectedDocIds.length) {
                  finishZipDownload();
                }
              };
              
              // 서명 이미지 로드 실패 처리
              sigImg.onerror = () => {
                console.error('서명 이미지 로드 실패');
                
                // 캔버스 이미지를 데이터 URL로 변환 (서명 없이)
                const dataUrl = canvas.toDataURL('image/png');
                const base64Data = dataUrl.split(',')[1];
                
                // 압축 파일에 추가
                zip.file(`원본_문서_${docId}.png`, base64Data, { base64: true });
                
                completedCount++;
                if (completedCount === selectedDocIds.length) {
                  finishZipDownload();
                }
              };
            } else {
              console.log(`문서 ID:${docId}에 서명 위치가 없습니다. 원본 이미지만 추가`);
              
              // 서명 없이 원본 이미지만 저장
              const dataUrl = canvas.toDataURL('image/png');
              const base64Data = dataUrl.split(',')[1];
              
              // 압축 파일에 추가
              zip.file(`원본_문서_${docId}.png`, base64Data, { base64: true });
              
              completedCount++;
              if (completedCount === selectedDocIds.length) {
                finishZipDownload();
              }
            }
          };
          
          // 원본 이미지 로드 실패 처리
          img.onerror = () => {
            console.error('원본 이미지 로드 실패');
            completedCount++;
            
            if (completedCount === selectedDocIds.length) {
              finishZipDownload();
            }
          };
        } catch (error) {
          console.error('문서 처리 오류:', error);
          completedCount++;
          
          if (completedCount === selectedDocIds.length) {
            finishZipDownload();
          }
        }
      });
      
      // 압축 파일 다운로드 함수
      function finishZipDownload() {
        zip.generateAsync({ type: 'blob' }).then((content: Blob) => {
          const zipUrl = URL.createObjectURL(content);
          const link = window.document.createElement('a');
          link.href = zipUrl;
          link.download = `서명문서_${new Date().toISOString().slice(0, 10)}.zip`;
          window.document.body.appendChild(link);
          link.click();
          window.document.body.removeChild(link);
          
          setTimeout(() => {
            URL.revokeObjectURL(zipUrl);
            setIsGeneratingPdf(false);
            setSuccess(`${selectedDocIds.length}개 문서 다운로드를 완료했습니다.`);
          }, 100);
        }).catch(err => {
          console.error('압축 파일 생성 실패:', err);
          setIsGeneratingPdf(false);
          setError('압축 파일 생성 중 오류가 발생했습니다.');
        });
      }
    }).catch(err => {
      console.error('JSZip 라이브러리 로드 실패:', err);
      setIsGeneratingPdf(false);
      setError('다운로드 모듈을 로드하지 못했습니다.');
    });
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
                  서명한 문서를 JPEG 이미지로 일괄 다운로드할 수 있습니다. 다운로드할 문서를 선택하세요.
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
                  onClick={handleDownloadAllAsJpeg}
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
                  {isGeneratingPdf ? '다운로드 중...' : `선택한 문서 다운로드 (${selectedCount}/${signedDocuments.length})`}
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
                      <div className="relative h-40 bg-gray-100" id={`preview-container-${doc.id}`}>
                        <img
                          id={`preview-image-${doc.id}`}
                          src={doc.imageUrl}
                          alt={`문서 ${doc.id}`}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'contain'
                          }}
                          onLoad={() => {
                            console.log('미리보기 이미지 로드 성공:', doc.id);
                            renderSignedDocumentPreview(doc.id);
                          }}
                        />
                      </div>
                      <div className="p-4 bg-white border-t border-gray-200 flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">문서 {doc.id}</span>
                          <span className="mx-1">•</span>
                          <span>{doc.signaturePositions.filter((pos: any) => pos.signed).length}개 서명</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation(); // 버블링 방지
                            downloadSingleDocument(doc.id);
                          }}
                          icon={
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          }
                        >
                          다운로드
                        </Button>
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