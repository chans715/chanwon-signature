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

// 인터페이스를 업데이트합니다
interface Document {
  id: number;
  imageUrl: string;
  pdfUrl: null | string;
  type: string;
  signaturePositions: SignaturePosition[];
}

// 인터페이스 확장: 서명 위치에 화면 표시용 속성 추가
interface SignaturePosition {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  signed?: boolean;
  // 화면 표시용 속성 추가
  displayX?: number;
  displayY?: number;
  displayWidth?: number;
  displayHeight?: number;
}

// 사용할 샘플 문서 데이터
const initialSampleDocuments = [
  {
    id: 1,
    imageUrl: '/images/document1.jpeg',
    pdfUrl: null,
    type: 'image',
    signaturePositions: [
      { 
        id: '1', 
        x: 100, 
        y: 300, 
        width: 150, 
        height: 60, 
        signed: false,
        displayX: 100,
        displayY: 300,
        displayWidth: 150,
        displayHeight: 60 
      },
      { 
        id: '2', 
        x: 300, 
        y: 400, 
        width: 150, 
        height: 60, 
        signed: false,
        displayX: 300,
        displayY: 400,
        displayWidth: 150,
        displayHeight: 60 
      },
    ]
  },
  {
    id: 2,
    imageUrl: '/images/document2.jpeg',
    pdfUrl: null,
    type: 'image',
    signaturePositions: [
      { 
        id: '1', 
        x: 120, 
        y: 280, 
        width: 150, 
        height: 60, 
        signed: false,
        displayX: 120,
        displayY: 280,
        displayWidth: 150,
        displayHeight: 60 
      },
    ]
  }
];

// MongoDB API URL
// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function DocumentSign() {
  const router = useRouter();
  const { addError } = useError();
  const [currentDocIndex, setCurrentDocIndex] = useState(0);
  const [signaturePositions, setSignaturePositions] = useState<Record<string, boolean>>({});
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customSignaturePositions, setCustomSignaturePositions] = useState<Array<Array<SignaturePosition>>>([]);
  const [imageErrorShown, setImageErrorShown] = useState<Record<number, boolean>>({});
  const [documents, setDocuments] = useState<Document[]>(initialSampleDocuments);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [dragInfo, setDragInfo] = useState<{
    isDragging: boolean;
    positionId: string | null;
    offsetX: number;
    offsetY: number;
  }>({
    isDragging: false,
    positionId: null,
    offsetX: 0,
    offsetY: 0
  });
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [activeSignaturePosition, setActiveSignaturePosition] = useState<string | null>(null);
  
  // 페이지 로드 시 서명 상태 초기화
  useEffect(() => {
    // 이미지 로딩 상태 초기화
    setImageErrorShown({});

    // 실제 사용자 문서 로드 (예: DB나 스토리지에서)
    // 여기서는 샘플 데이터를 사용
    const loadUserDocuments = async () => {
      try {
        // 세션 스토리지에서 이전에 서명된 문서가 있는지 확인
        const savedSignedDocuments = sessionStorage.getItem('signedDocuments');
        let userDocs = initialSampleDocuments;
        let loadedSignedPositions: Record<string, boolean> = {};
        let hadSavedData = false;

        // 세션 스토리지에서 서명된 문서 데이터가 있으면 복원
        if (savedSignedDocuments) {
          try {
            const parsedSignedDocs = JSON.parse(savedSignedDocuments);
            if (Array.isArray(parsedSignedDocs) && parsedSignedDocs.length > 0) {
              console.log('이전에 서명한 문서 데이터 복원:', parsedSignedDocs);
              userDocs = parsedSignedDocs;
              
              // 서명 위치 상태 복원
              parsedSignedDocs.forEach(doc => {
                if (doc.signaturePositions) {
                  doc.signaturePositions.forEach((pos: { id: string; signed?: boolean }) => {
                    if (pos.signed) {
                      loadedSignedPositions[pos.id] = true;
                    }
                  });
                }
              });
              
              hadSavedData = true;
            }
          } catch (parseErr) {
            console.error('저장된 서명 문서 파싱 오류:', parseErr);
          }
        }
        
        // 세션 스토리지에서 이전에 업로드한 문서가 있고 서명 데이터가 없는 경우
        if (!hadSavedData) {
          const uploadedDocuments = sessionStorage.getItem('uploadedDocuments');
          if (uploadedDocuments) {
            const parsedDocs = JSON.parse(uploadedDocuments);
            if (Array.isArray(parsedDocs) && parsedDocs.length > 0) {
              // 업로드된 문서가 있으면 사용
              userDocs = parsedDocs.map((doc, index) => ({
                ...doc,
                id: index + 1,
                type: 'image',
                signaturePositions: doc.signaturePositions || [
                  { id: `auto-${index}-1`, x: 100, y: 300, width: 150, height: 60, signed: false }
                ]
              }));
              console.log('업로드된 문서를 로드했습니다:', parsedDocs);
            } else {
              // 업로드된 문서가 없으면 샘플 데이터 사용
              console.log('업로드된 문서가 없어 샘플 데이터를 사용합니다');
            }
          }
        }
        
        // 문서와 서명 위치 상태 설정
        setDocuments(userDocs);
        setSignaturePositions(loadedSignedPositions);
        
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
    // 서명 이미지 로드 시도
    const loadSignature = () => {
      console.log('서명 이미지 로드 시도...');
      
      // 먼저 세션 스토리지에서 시도
      let savedSignature = sessionStorage.getItem('userSignature');
      
      // 세션 스토리지에 없다면 window 객체에서 백업 확인
      if (!savedSignature) {
        console.warn('세션 스토리지에 서명 이미지 없음. window 객체에서 확인...');
        // @ts-ignore
        if (window.__signature) {
          // @ts-ignore
          savedSignature = window.__signature as string;
          console.log('window 객체에서 서명 이미지 복구 성공!');
          
          // 복구된 데이터를 세션 스토리지에 다시 저장
          try {
            sessionStorage.setItem('userSignature', savedSignature);
            console.log('복구된 서명 데이터를 세션 스토리지에 저장 성공');
          } catch (err) {
            console.error('복구된 서명 데이터 저장 실패:', err);
          }
        }
      }
      
      if (savedSignature) {
        console.log('서명 데이터 로드 성공 (길이):', savedSignature.length);
        setSignatureImage(savedSignature);
        setIsLoading(false);
      } else {
        console.error('세션 스토리지와 백업에서 서명을 찾을 수 없습니다.');
        addError('error', '저장된 서명을 찾을 수 없습니다. 서명을 다시 입력해주세요.', true, 5000);
        
        // 짧은 지연 후 서명 페이지로 이동
        setTimeout(() => {
          router.push('/signature');
        }, 1000);
      }
    };
    
    // 페이지 로드 시 서명 이미지 로드
    loadSignature();
  }, [addError, router]);
  
  // 서명 위치에 서명 추가하기 함수 개선
  const addSignature = (positionId: string) => {
    console.log('서명 추가 시도 - 위치 ID:', positionId, '문서 인덱스:', currentDocIndex);
    
    // 세션 스토리지에서 서명 가져오기
    const signatureData = sessionStorage.getItem('userSignature');
    
    if (!signatureData) {
      console.error('세션 스토리지에서 서명 데이터를 찾을 수 없습니다.');
      addError('error', '서명 이미지를 찾을 수 없습니다. 서명 단계로 돌아가 다시 서명해주세요.', true, 5000);
      return;
    }
    
    console.log('서명 데이터 로드 성공 (길이):', signatureData.length);
    
    try {
      // 서명 이미지 설정
      setSignatureImage(signatureData);
      
      // 새로운 서명 위치 상태 생성
      const newSignaturePositions = { ...signaturePositions };
      newSignaturePositions[positionId] = true;
      
      // 서명 위치 상태 업데이트
      setSignaturePositions(newSignaturePositions);
      console.log('서명 위치 상태 업데이트:', newSignaturePositions);
      
      // 문서 상태 업데이트 준비
      const newDocuments = [...documents];
      
      // 현재 문서의 실제 인덱스 찾기 (ID 기반)
      const docIndex = newDocuments.findIndex(doc => doc.id === currentDocument.id);
      console.log(`서명 추가 - 현재 문서 ID: ${currentDocument.id}, 검색된 문서 인덱스: ${docIndex}`);
      
      if (docIndex === -1) {
        console.error(`문서 ID ${currentDocument.id}에 해당하는 문서를 찾을 수 없습니다.`);
        addError('error', '서명 위치를 업데이트할 문서를 찾을 수 없습니다.', true, 3000);
        return;
      }
      
      // 서명 위치 배열에서 해당 ID의 위치 찾기
      const posIndex = newDocuments[docIndex].signaturePositions.findIndex(pos => pos.id === positionId);
      console.log(`서명 위치 ID: ${positionId}, 위치 인덱스: ${posIndex}`);
      
      if (posIndex === -1) {
        console.error(`서명 위치 ID를 찾을 수 없습니다: ${positionId}`);
        addError('error', '서명 위치를 찾을 수 없습니다.', true, 3000);
        return;
      }
      
      // 서명 위치 업데이트
      newDocuments[docIndex].signaturePositions[posIndex] = {
        ...newDocuments[docIndex].signaturePositions[posIndex],
        signed: true
      };
      
      console.log('서명된 위치 정보:', newDocuments[docIndex].signaturePositions[posIndex]);
      
      // 문서 상태 업데이트
      setDocuments(newDocuments);
      
      // 서명된 문서 정보를 세션 스토리지에 저장
      try {
        const serializedData = JSON.stringify(newDocuments);
        sessionStorage.setItem('signedDocuments', serializedData);
        
        // 서명 상태도 별도로 저장
        sessionStorage.setItem('signaturePositions', JSON.stringify(newSignaturePositions));
        
        console.log('세션 스토리지에 문서 및 서명 상태 저장 성공');
      } catch (storageError) {
        console.error('세션 스토리지 저장 오류:', storageError);
      }
      
      addError('success', '서명이 추가되었습니다.', true, 2000);
      
      // 서명 후 서명 완료 상태 확인 - 디버깅용
      setTimeout(() => {
        console.log('서명 후 문서 상태 확인:');
        console.log('현재 문서 인덱스:', currentDocIndex);
        console.log('현재 문서:', currentDocument);
        console.log('서명 완료 여부:', isCurrentDocumentFullySigned());
      }, 500);
      
    } catch (error) {
      console.error('서명 추가 중 오류:', error);
      addError('error', '서명 추가 중 오류가 발생했습니다.', true, 3000);
    }
  };
  
  // 현재 문서의 모든 위치에 서명이 되었는지 확인 - 수정
  const isCurrentDocumentFullySigned = () => {
    console.log('서명 완료 확인 - 현재 문서 인덱스:', currentDocIndex);
    console.log('서명 완료 확인 - 현재 문서 ID:', currentDocument.id);
    
    if (!currentDocument || !currentDocument.signaturePositions) {
      console.log('현재 문서 정보가 없거나 서명 위치가 없음');
      return false; // 문서 정보가 없으면 미완료 상태로 간주
    }
    
    if (currentDocument.signaturePositions.length === 0) {
      console.log('서명 위치가 없음, 서명 완료로 간주');
      return true; // 서명 위치가 없으면 완료된 것으로 간주
    }
    
    // 현재 문서의 모든 서명 위치 확인
    const allPositionsSigned = currentDocument.signaturePositions.every(pos => pos.signed === true);
    console.log('모든 서명 위치 완료 여부:', allPositionsSigned);
    console.log('서명 위치 상태:', currentDocument.signaturePositions);
    
    return allPositionsSigned;
  };
  
  // handleDocumentClick 함수 개선
  const handleDocumentClick = (event: React.MouseEvent<HTMLElement>) => {
    console.log('문서 클릭 이벤트 발생');
    console.log('현재 문서 인덱스:', currentDocIndex);
    console.log('현재 문서 정보:', currentDocument);
    
    // 이미 서명이 완료된 경우 클릭 이벤트 무시
    if (isCurrentDocumentFullySigned()) {
      console.log('이미 서명이 완료되어 추가 서명 필드를 생성할 수 없습니다.');
      addError('warning', '이미 서명이 완료되어 추가 서명 필드를 생성할 수 없습니다.', true, 3000);
      return;
    }
    
    // 이벤트 버블링 방지
    event.stopPropagation();
    event.preventDefault();

    // 이미지 요소 접근
    let imageElement: HTMLImageElement | null = null;
    
    // 클릭된 요소 확인
    console.log('클릭된 요소 태그명:', (event.target as HTMLElement).tagName);
    console.log('클릭된 요소 클래스:', (event.target as HTMLElement).className);
    
    // 클릭된 요소가 이미지인지 확인
    if (event.target instanceof HTMLImageElement) {
      imageElement = event.target as HTMLImageElement;
      console.log('클릭된 요소는 이미지입니다.');
    } else {
      console.log('클릭된 요소는 이미지가 아닙니다. 이미지 요소를 찾습니다.');
      
      // 가장 가까운 이미지 컨테이너 찾기
      const container = event.currentTarget.closest('.relative.w-full.h-\\[600px\\]');
      if (!container) {
        console.error('이미지 컨테이너를 찾을 수 없습니다.');
        addError('error', '이미지 컨테이너를 찾을 수 없습니다.', true, 3000);
        return;
      }
      
      // 컨테이너 내에서 이미지 요소 찾기
      imageElement = container.querySelector('img');
      if (!imageElement) {
        console.error('이미지 요소를 찾을 수 없습니다.');
        addError('error', '이미지 요소를 찾을 수 없습니다.', true, 3000);
        return;
      }
      console.log('컨테이너 내에서 이미지 요소를 찾았습니다.');
    }
    
    // 이미지 메타데이터 확인
    console.log('이미지 정보:', {
      naturalWidth: imageElement.naturalWidth,
      naturalHeight: imageElement.naturalHeight,
      clientWidth: imageElement.clientWidth,
      clientHeight: imageElement.clientHeight,
      offsetWidth: imageElement.offsetWidth,
      offsetHeight: imageElement.offsetHeight,
      src: imageElement.src
    });
    
    // 이미지가 로드되지 않은 경우 처리
    if (imageElement.naturalWidth === 0 || imageElement.naturalHeight === 0) {
      console.error('이미지가 아직 로드되지 않았습니다.');
      addError('error', '이미지가 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.', true, 3000);
      return;
    }
    
    // 이미지의 정확한 위치와 크기 정보 가져오기
    const rect = imageElement.getBoundingClientRect();
    console.log('이미지 위치 정보(getBoundingClientRect):', rect);
    
    // 이미지 내부에서의 클릭 위치 계산 (이미지 좌상단 기준)
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;
    console.log(`클릭 좌표 (이미지 내): X=${offsetX}, Y=${offsetY}`);
    
    // 이미지의 화면 표시 크기와 원본 크기 비율 계산
    const scaleX = imageElement.naturalWidth / rect.width;
    const scaleY = imageElement.naturalHeight / rect.height;
    console.log(`이미지 비율: scaleX=${scaleX.toFixed(2)}, scaleY=${scaleY.toFixed(2)}`);
    
    // 서명 필드 크기 (화면 표시 기준)
    const signatureWidth = 150; // 화면에 표시될 서명 너비
    const signatureHeight = 80; // 화면에 표시될 서명 높이
    
    // 서명 필드가 클릭 위치의 중앙에 오도록 계산
    const displayX = offsetX - (signatureWidth / 2);
    const displayY = offsetY - (signatureHeight / 2);
    console.log(`중앙 정렬 위치: displayX=${displayX.toFixed(2)}, displayY=${displayY.toFixed(2)}`);
    
    // 화면 표시 좌표가 이미지 경계를 벗어나지 않도록 조정
    const adjustedDisplayX = Math.max(0, Math.min(displayX, rect.width - signatureWidth));
    const adjustedDisplayY = Math.max(0, Math.min(displayY, rect.height - signatureHeight));
    console.log(`경계 조정 위치: adjustedDisplayX=${adjustedDisplayX.toFixed(2)}, adjustedDisplayY=${adjustedDisplayY.toFixed(2)}`);
    
    // 원본 이미지 기준 좌표 계산 (서명 저장 및 렌더링에 사용)
    const originalX = Math.round(adjustedDisplayX * scaleX);
    const originalY = Math.round(adjustedDisplayY * scaleY);
    const originalWidth = Math.round(signatureWidth * scaleX);
    const originalHeight = Math.round(signatureHeight * scaleY);
    console.log(`원본 이미지 좌표: originalX=${originalX}, originalY=${originalY}, originalWidth=${originalWidth}, originalHeight=${originalHeight}`);
    
    // 새로운 서명 위치 객체 생성
    const newPosition = {
      id: `manual-${Date.now()}`, // 고유 ID 생성
      x: originalX, // 원본 이미지 기준 X 좌표
      y: originalY, // 원본 이미지 기준 Y 좌표
      width: originalWidth, // 원본 이미지 기준 너비
      height: originalHeight, // 원본 이미지 기준 높이
      displayX: adjustedDisplayX, // 화면 표시용 X 좌표
      displayY: adjustedDisplayY, // 화면 표시용 Y 좌표
      displayWidth: signatureWidth, // 화면 표시용 너비
      displayHeight: signatureHeight, // 화면 표시용 높이
      signed: false, // 초기 상태는 서명되지 않음
    };
    
    console.log('새로운 서명 위치 객체:', newPosition);
    
    // 새로운 서명 위치 추가
    const newDocuments = [...documents];
    
    // 현재 문서의 실제 인덱스 찾기
    const docIndex = newDocuments.findIndex(doc => doc.id === currentDocument.id);
    console.log(`현재 문서 ID: ${currentDocument.id}, 검색된 문서 인덱스: ${docIndex}`);
    console.log('현재 문서 배열:', newDocuments.map(doc => `ID: ${doc.id}`));
    
    if (docIndex !== -1) {
      // 해당 문서의 서명 위치 배열에 새 위치 추가
      newDocuments[docIndex].signaturePositions.push(newPosition);
      setDocuments(newDocuments);
      
      // 커스텀 위치 배열도 업데이트
      const newCustomPositions = [...customSignaturePositions];
      if (newCustomPositions[docIndex]) {
        newCustomPositions[docIndex].push(newPosition);
      } else {
        newCustomPositions[docIndex] = [newPosition];
      }
      setCustomSignaturePositions(newCustomPositions);
      
      // 세션 스토리지 업데이트
      try {
        sessionStorage.setItem('signedDocuments', JSON.stringify(newDocuments));
        console.log('서명 필드 위치 저장 완료');
      } catch (err) {
        console.error('세션 스토리지 업데이트 오류:', err);
        addError('error', '서명 위치 저장 중 오류가 발생했습니다.', true, 3000);
      }
      
      // 성공 메시지 표시
      addError('success', '서명 위치가 추가되었습니다.', true, 2000);
    } else {
      console.error(`문서 ID ${currentDocument.id}에 해당하는 문서를 찾을 수 없습니다.`);
      console.log('현재 문서 배열:', documents.map(doc => `ID: ${doc.id}`));
      addError('error', '문서를 찾을 수 없습니다.', true, 3000);
    }
  };
  
  // 서명 위치 삭제
  const removeSignaturePosition = (positionId: string) => {
    console.log('서명 위치 삭제 시도:', positionId);
    
    // 모든 모드에서 서명 위치를 삭제할 수 있도록 수정
      const updatedPositions = [...customSignaturePositions];
      if (updatedPositions[currentDocIndex]) {
        updatedPositions[currentDocIndex] = updatedPositions[currentDocIndex].filter(
          pos => pos.id !== positionId
        );
        setCustomSignaturePositions(updatedPositions);
    }
        
        // 서명도 함께 삭제
    if (signaturePositions[positionId]) {
      const updatedSignaturePositions = { ...signaturePositions };
      delete updatedSignaturePositions[positionId];
      setSignaturePositions(updatedSignaturePositions);
    }
          
          // 문서 상태도 업데이트
          const newDocuments = [...documents];
          const docIndex = newDocuments.findIndex(doc => doc.id === currentDocIndex + 1);
          
          if (docIndex !== -1) {
            newDocuments[docIndex] = {
              ...newDocuments[docIndex],
              signaturePositions: newDocuments[docIndex].signaturePositions.filter(
                pos => pos.id !== positionId
              )
            };
            
            setDocuments(newDocuments);
            
            // 세션 스토리지 업데이트
            try {
              sessionStorage.setItem('signedDocuments', JSON.stringify(newDocuments));
        sessionStorage.setItem('signaturePositions', JSON.stringify(signaturePositions));
            } catch (err) {
              console.error('세션 스토리지 업데이트 오류:', err);
          }
        }
        
        addError('info', '서명 위치가 삭제되었습니다.', true, 2000);
  };
  
  // 서명 위치 드래그 시작
  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>, positionId: string) => {
    if (!isCustomMode) return;
    
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    setDragInfo({
      isDragging: true,
      positionId,
      offsetX,
      offsetY
    });
    
    console.log('드래그 시작:', positionId);
  };
  
  // 서명 위치 드래그 중
  const handleDragMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragInfo.isDragging || !isCustomMode) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const containerRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - containerRect.left - dragInfo.offsetX;
    const y = e.clientY - containerRect.top - dragInfo.offsetY;
    
    // 컨테이너 경계 확인
    const updatedPositions = [...customSignaturePositions];
    const positionIndex = updatedPositions[currentDocIndex]?.findIndex(
      pos => pos.id === dragInfo.positionId
    );
    
    if (positionIndex !== -1 && positionIndex !== undefined) {
      const position = updatedPositions[currentDocIndex][positionIndex];
      const width = position.width;
      const height = position.height;
      
      // 컨테이너 내에 위치하도록 제한
      const newX = Math.max(0, Math.min(x, containerRect.width - width));
      const newY = Math.max(0, Math.min(y, containerRect.height - height));
      
      updatedPositions[currentDocIndex][positionIndex] = {
        ...position,
        x: newX,
        y: newY
      };
      
      setCustomSignaturePositions(updatedPositions);
    }
  };
  
  // 서명 위치 드래그 종료
  const handleDragEnd = () => {
    if (!dragInfo.isDragging || !isCustomMode) return;
    
    setDragInfo({
      isDragging: false,
      positionId: null,
      offsetX: 0,
      offsetY: 0
    });
    
    console.log('드래그 종료');
    
    // 변경된 서명 위치를 저장
    const updatedDocuments = [...documents];
    const docIndex = updatedDocuments.findIndex(doc => doc.id === currentDocIndex + 1);
    
    if (docIndex !== -1 && customSignaturePositions[currentDocIndex]) {
      // 타입 에러 수정: signed 속성을 명시적으로 지정
      const updatedPositions = customSignaturePositions[currentDocIndex].map(pos => ({
        ...pos,
        signed: pos.signed === true // undefined인 경우 false로 설정
      }));
      
      updatedDocuments[docIndex] = {
        ...updatedDocuments[docIndex],
        signaturePositions: updatedPositions
      };
      
      setDocuments(updatedDocuments);
      
      // 세션 스토리지 업데이트
      try {
        sessionStorage.setItem('signedDocuments', JSON.stringify(updatedDocuments));
      } catch (err) {
        console.error('세션 스토리지 업데이트 오류:', err);
      }
    }
  };
  
  // 서명 문서 저장 함수 개선
  const saveSignedDocumentForDownload = () => {
    try {
      console.log('[시작] 서명 문서 저장 함수');
      
      // 모든 문서에 최소 하나의 서명이 있는지 확인
      const allDocumentsSigned = documents.every(doc => {
        const hasSignedPosition = doc.signaturePositions.some(pos => pos.signed);
        if (!hasSignedPosition) {
          console.warn(`문서 ID:${doc.id}에 서명되지 않은 위치가 있습니다.`);
        }
        return hasSignedPosition;
      });
      
      if (!allDocumentsSigned) {
        console.warn('모든 문서에 서명을 완료하지 않았습니다.');
        if (!window.confirm('일부 문서에 서명이 완료되지 않았습니다. 계속 진행하시겠습니까?')) {
          return false;
        }
      }
      
      // 서명 이미지 가져오기
      let signature = signatureImage;
      if (!signature) {
        signature = sessionStorage.getItem('userSignature');
        if (!signature) {
          console.error('서명 이미지를 찾을 수 없습니다.');
          addError('error', '서명 이미지를 찾을 수 없습니다. 서명을 다시 작성해주세요.', true, 5000);
          return false;
        }
      }
      
      // 서명된 문서 정보 구성 (다운로드용)
      const signedDocsForDownload = documents.map(doc => {
        // 각 문서의 서명 위치 정보 유지 (화면 표시용 좌표 포함)
        const positions = doc.signaturePositions.map(pos => ({
          ...pos,
          // 원본 이미지 기준 좌표 확인 (누락된 경우 화면 좌표로 계산)
          x: pos.x !== undefined ? pos.x : (pos.displayX || 0),
          y: pos.y !== undefined ? pos.y : (pos.displayY || 0),
          width: pos.width !== undefined ? pos.width : (pos.displayWidth || 150),
          height: pos.height !== undefined ? pos.height : (pos.displayHeight || 80),
          // 화면 표시용 좌표 유지
          displayX: pos.displayX !== undefined ? pos.displayX : pos.x,
          displayY: pos.displayY !== undefined ? pos.displayY : pos.y,
          displayWidth: pos.displayWidth !== undefined ? pos.displayWidth : pos.width,
          displayHeight: pos.displayHeight !== undefined ? pos.displayHeight : pos.height
        }));
        
        // 이미지 정보 디버깅
        const img = document.querySelector(`img[src='${doc.imageUrl}']`) as HTMLImageElement;
        const imgInfo = img ? {
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          clientWidth: img.clientWidth,
          clientHeight: img.clientHeight
        } : { naturalWidth: 0, naturalHeight: 0, clientWidth: 0, clientHeight: 0 };
        
        console.log(`문서 ID:${doc.id} 이미지 정보:`, imgInfo);
        
        // 문서 정보 반환 (원본 이미지 크기 정보 포함)
        return {
          ...doc,
          signaturePositions: positions,
          naturalWidth: imgInfo.naturalWidth,
          naturalHeight: imgInfo.naturalHeight
        };
      });
      
      console.log('저장할 서명 문서:', signedDocsForDownload);
      console.log('서명 이미지 (일부):', signature?.substring(0, 50) + '...');
      
      // 로컬 스토리지에 저장 (다운로드용)
      try {
        localStorage.setItem('signedDocumentsForDownload', JSON.stringify(signedDocsForDownload));
        localStorage.setItem('userSignatureForDownload', signature);
        localStorage.setItem('documentsSignedDate', new Date().toISOString());
        
        console.log('서명 문서 및 서명 이미지를 로컬 스토리지에 저장했습니다.');
        return true;
      } catch (storageError) {
        console.error('로컬 스토리지 저장 오류:', storageError);
        
        // 로컬 스토리지 오류 시 세션 스토리지 시도
        try {
          sessionStorage.setItem('signedDocumentsForDownload', JSON.stringify(signedDocsForDownload));
          sessionStorage.setItem('userSignatureForDownload', signature);
          sessionStorage.setItem('documentsSignedDate', new Date().toISOString());
          
          console.log('서명 문서 및 서명 이미지를 세션 스토리지에 저장했습니다.');
          return true;
        } catch (sessionError) {
          console.error('세션 스토리지 저장 오류:', sessionError);
          addError('error', '서명 문서를 저장할 수 없습니다. 브라우저 스토리지 공간이 부족할 수 있습니다.', true, 5000);
          return false;
        }
      }
    } catch (error) {
      console.error('서명 문서 저장 중 오류:', error);
      addError('error', '서명 문서 저장 중 오류가 발생했습니다.', true, 5000);
      return false;
    }
  };
  
  // goToNextDocument 함수 수정
  const goToNextDocument = () => {
    console.log('다음 문서로 이동 시도:', currentDocIndex, '총 문서:', totalDocuments);
    
    if (!isCurrentDocumentFullySigned()) {
      console.log('현재 문서 서명이 완료되지 않음');
      addError('warning', '모든 서명 위치에 서명을 추가해주세요.', true, 3000);
      return;
    }
    
    // 로컬 스토리지에 저장
    const saveResult = saveSignedDocumentForDownload();
    console.log('문서 저장 결과:', saveResult);
    
    if (currentDocIndex < totalDocuments - 1) {
      // 다음 문서로 이동
      setCurrentDocIndex(prev => prev + 1);
      addError('info', `${currentDocIndex + 2}번째 문서로 이동합니다.`, true, 2000);
    } else {
      // 모든 문서에 서명 완료
      console.log('모든 문서 서명 완료, 신분증 업로드 페이지로 이동');
      addError('success', '모든 문서에 서명이 완료되었습니다. 신분증 업로드 페이지로 이동합니다.', true, 3000);
      
      // 서명 완료 정보 저장
      sessionStorage.setItem('documentsSignedCount', totalDocuments.toString());
      sessionStorage.setItem('documentsSignedDate', new Date().toISOString());
      
      // 서명된 문서 정보 최종 저장
      const signedDocuments = documents.map(doc => {
        return {
          id: doc.id,
          imageUrl: doc.imageUrl,
          pdfUrl: doc.pdfUrl,
          type: doc.type,
          signaturePositions: doc.signaturePositions
        };
      });
      
      // 세션 및 로컬 스토리지에 저장
      sessionStorage.setItem('signedDocuments', JSON.stringify(signedDocuments));
      localStorage.setItem('signedDocumentsForDownload', JSON.stringify(signedDocuments));
      localStorage.setItem('userSignatureForDownload', signatureImage || sessionStorage.getItem('userSignature') || '');
      localStorage.setItem('hasSignature', 'true');
      
      // 신분증 업로드 페이지로 이동
      setTimeout(() => {
        router.push('/id-card');
      }, 1000);
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
      return positions.length === 0 || positions.every(pos => signaturePositions[pos.id]);
    });
  };
  
  // 커스텀 모드 전환
  const toggleCustomMode = () => {
    setIsCustomMode(prev => !prev);
    addError('info', isCustomMode ? '기본 서명 모드로 전환합니다.' : '커스텀 서명 모드로 전환합니다. 문서를 클릭하여 서명 위치를 추가하세요.', true, 3000);
  };
  
  // 서명 핸들러 - 수정
  const handleSignatureButtonClick = (positionId: string) => {
    console.log('서명 추가 클릭:', positionId, '현재 문서:', currentDocIndex);
    
    if (!signatureImage) {
      addError('info', '서명을 먼저 입력해주세요.', true, 2000);
      setIsSignatureModalOpen(true);
      setActiveSignaturePosition(positionId);
      return;
    }

    // 서명 추가 함수 호출
    addSignature(positionId);
    
    // 로그 추가 - 클릭된 서명 위치 정보 출력
    const position = currentSignaturePositions.find(pos => pos.id === positionId);
    if (position) {
      console.log(`클릭된 서명 위치: ID=${positionId}, x=${position.x}, y=${position.y}, 너비=${position.width}, 높이=${position.height}`);
    }

    addError('success', '서명이 추가되었습니다.', true, 1500);
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
                    문서를 클릭하여 원하는 위치에 서명 필드를 추가하세요. 서명 필드를 클릭하면 삭제됩니다. 서명은 아래 '서명등록' 버튼을 통해서만 가능합니다.
                  </p>
                </div>
              </div>
            </div>
            
            <div 
              className="relative border border-gray-300 rounded-md mb-6 overflow-hidden"
              style={{ cursor: 'crosshair' }}
              onMouseMove={handleDragMove}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
            >
              {/* 문서 표시 (이미지 또는 PDF) */}
              {currentDocument.type === 'image' ? (
                <div 
                  className="relative w-full h-[600px]"
                >
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
                        className="bg-white cursor-crosshair"
                        onClick={(e) => {
                          console.log('이미지 클릭됨');
                          e.stopPropagation(); // 이벤트 버블링 방지
                          handleDocumentClick(e);
                        }}
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
                        signaturePositions[position.id] ? 'border-green-500 bg-green-50/30' : 'border-red-500 animate-pulse'
                      } rounded-md flex items-center justify-center`}
                      style={{
                        left: `${position.displayX}px`,
                        top: `${position.displayY}px`,
                        width: `${position.displayWidth || 150}px`,
                        height: `${position.displayHeight || 60}px`,
                      }}
                      onClick={(e) => {
                        // 서명 필드 클릭시 항상 삭제
                          e.stopPropagation();
                          removeSignaturePosition(position.id);
                      }}
                      onMouseDown={(e) => handleDragStart(e, position.id)}
                    >
                      {signaturePositions[position.id] ? (
                        <img 
                          src={signatureImage || ''} 
                          alt="서명" 
                          style={{ 
                            width: `${position.displayWidth || 150}px`,
                            height: `${position.displayHeight || 60}px`,
                            objectFit: 'contain',
                            background: 'transparent'
                          }}
                        />
                      ) : (
                        <div className="relative w-full h-full flex items-center justify-center">
                          <span className="text-xs text-red-500 font-medium">서명 필요</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div 
                  className="relative w-full h-[600px]"
                  onClick={(event) => {
                    // PDF 문서에서는 컨테이너 클릭 이벤트로 처리
                    if (isCurrentDocumentFullySigned()) {
                      console.log('이미 서명이 완료되어 추가 서명 필드를 생성할 수 없습니다.');
                      return;
                    }
                    
                    const container = event.currentTarget;
                    const rect = container.getBoundingClientRect();
                    
                    // 클릭 위치 계산
                    const offsetX = event.clientX - rect.left;
                    const offsetY = event.clientY - rect.top;
                    
                    // PDF 문서에서는 화면에 표시된 좌표를 그대로 사용
                    const signatureWidth = 150;
                    const signatureHeight = 80;
                    
                    // 중앙 정렬 및 경계 체크
                    const centeredX = offsetX - (signatureWidth / 2);
                    const centeredY = offsetY - (signatureHeight / 2);
                    const containerWidth = container.clientWidth;
                    const containerHeight = container.clientHeight;
                    const adjustedX = Math.max(0, Math.min(centeredX, containerWidth - signatureWidth));
                    const adjustedY = Math.max(0, Math.min(centeredY, containerHeight - signatureHeight));
                    
                    // 새 서명 위치 생성
                    const newPosition = {
                      id: `${Date.now()}`,
                      x: adjustedX,
                      y: adjustedY,
                      width: signatureWidth,
                      height: signatureHeight,
                      displayX: adjustedX,
                      displayY: adjustedY,
                      displayWidth: signatureWidth,
                      displayHeight: signatureHeight,
                      signed: false
                    };
                    
                    // 서명 위치 추가
                    const newDocuments = [...documents];
                    const docIndex = newDocuments.findIndex(doc => doc.id === currentDocIndex + 1);
                    
                    if (docIndex !== -1) {
                      newDocuments[docIndex].signaturePositions.push(newPosition);
                      setDocuments(newDocuments);
                      
                      // 세션 스토리지 업데이트
                      try {
                        sessionStorage.setItem('signedDocuments', JSON.stringify(newDocuments));
                        console.log('PDF 서명 필드 위치 저장 완료');
                      } catch (err) {
                        console.error('세션 스토리지 업데이트 오류:', err);
                      }
                    }
                    
                    addError('success', 'PDF 서명 위치가 추가되었습니다.', true, 2000);
                  }}
                >
                  {currentDocument.pdfUrl && (
                    <PDFViewer pdfUrl={currentDocument.pdfUrl} />
                  )}
                  
                  {/* PDF에도 서명 위치 표시 */}
                  {currentSignaturePositions.map((position) => (
                    <div
                      key={position.id}
                      className={`absolute border-2 ${
                        signaturePositions[position.id] ? 'border-green-500 bg-green-50/30' : 'border-red-500 animate-pulse'
                      } rounded-md flex items-center justify-center z-10`}
                      style={{
                        left: `${position.displayX}px`,
                        top: `${position.displayY}px`,
                        width: `${position.displayWidth || 150}px`,
                        height: `${position.displayHeight || 60}px`,
                      }}
                      onClick={(e) => {
                        // 서명 필드 클릭시 항상 삭제
                          e.stopPropagation();
                          removeSignaturePosition(position.id);
                      }}
                      onMouseDown={(e) => handleDragStart(e, position.id)}
                    >
                      {signaturePositions[position.id] ? (
                        <img 
                          src={signatureImage || ''} 
                          alt="서명" 
                          style={{ 
                            width: `${position.displayWidth || 150}px`,
                            height: `${position.displayHeight || 60}px`,
                            objectFit: 'contain',
                            background: 'transparent'
                          }}
                        />
                      ) : (
                        <div className="relative w-full h-full flex items-center justify-center">
                          <span className="text-xs text-red-500 font-medium">서명 필요</span>
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
                      onClick={() => handleSignatureButtonClick(position.id)}
                      disabled={signaturePositions[position.id]}
                      variant={signaturePositions[position.id] ? "success" : "primary"}
                      size="sm"
                      icon={
                        signaturePositions[position.id] ? (
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
                      {signaturePositions[position.id] ? '서명 완료' : `서명등록 ${index + 1}`}
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">문서를 클릭하여 서명 위치를 추가해주세요.</p>
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