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
  
  // 서명 위치에 서명 추가하기
  const addSignature = (positionId: string) => {
    console.log('서명 추가 시도:', positionId, '문서 인덱스:', currentDocIndex);
    
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
      
      // 문서 인덱스와 ID 확인용 디버깅
      console.log(`서명 추가 중 - 현재 문서 인덱스: ${currentDocIndex}`);
      console.log(`서명 추가 중 - 문서 목록:`, newDocuments.map(d => `ID: ${d.id}`));
      
      // 문서 ID가 아닌 인덱스로 문서 찾기
      let docIndex = currentDocIndex;
      
      // 인덱스 범위 체크
      if (docIndex < 0 || docIndex >= newDocuments.length) {
        console.error(`유효하지 않은 문서 인덱스: ${docIndex}`);
        addError('error', '서명 위치를 찾을 수 없습니다.', true, 3000);
        return;
      }
      
      // 현재 문서의 서명 위치 가져오기
      const currentPositions = [...newDocuments[docIndex].signaturePositions];
      
      // 해당 ID의 서명 위치 찾기
      const posIndex = currentPositions.findIndex(pos => pos.id === positionId);
      
      if (posIndex === -1) {
        console.error(`서명 위치 ID를 찾을 수 없습니다: ${positionId}`);
        addError('error', '서명 위치를 찾을 수 없습니다.', true, 3000);
        return;
      }
      
      // 서명 위치 업데이트
      currentPositions[posIndex] = {
        ...currentPositions[posIndex],
        signed: true
      };
      
      // 문서 업데이트
      newDocuments[docIndex] = {
        ...newDocuments[docIndex],
        signaturePositions: currentPositions
      };
      
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
    } catch (error) {
      console.error('서명 추가 중 오류:', error);
      addError('error', '서명 추가 중 오류가 발생했습니다.', true, 3000);
    }
  };
  
  // 현재 문서의 모든 위치에 서명이 되었는지 확인
  const isCurrentDocumentFullySigned = () => {
    if (!currentSignaturePositions || currentSignaturePositions.length === 0) {
      return true; // 서명 위치가 없으면 이미 완료된 것으로 간주
    }
    
    // 현재 문서의 signaturePositions 배열에서 signed 속성 확인
    const docIndex = documents.findIndex(doc => doc.id === currentDocIndex + 1);
    
    if (docIndex !== -1) {
      const signedPositionsInDoc = documents[docIndex].signaturePositions;
      
      // 현재 문서의 모든 서명 위치가 signed 상태인지 확인
      const result = signedPositionsInDoc.length > 0 && signedPositionsInDoc.every(pos => pos.signed === true);
      
      console.log(`문서 ${currentDocIndex + 1} 서명 완료 여부:`, result, signedPositionsInDoc);
      
      return result;
    }
    
    // 문서가 아직 documents 배열에 없는 경우 false 반환
    return false;
  };
  
  // handleDocumentClick 함수 개선
  const handleDocumentClick = (event: React.MouseEvent<HTMLElement>) => {
    // 이미 서명이 완료된 경우 클릭 이벤트 무시
    if (isCurrentDocumentFullySigned()) {
      console.log('이미 서명이 완료되어 추가 서명 필드를 생성할 수 없습니다.');
      return;
    }

    // 이벤트 버블링 방지
    event.stopPropagation();

    // 이미지 요소 접근
    let imageElement: HTMLImageElement;
    
    // 클릭된 요소가 이미지인지 확인
    if (event.currentTarget instanceof HTMLImageElement) {
      imageElement = event.currentTarget as HTMLImageElement;
    } else {
      // 이미지 컨테이너 내의 이미지 요소 찾기
      const container = event.currentTarget;
      const imgElement = container.querySelector('img');
      if (!imgElement) {
        console.error('이미지 요소를 찾을 수 없습니다.');
        return;
      }
      imageElement = imgElement;
    }
    
    // 이미지의 정확한 위치와 크기 정보 가져오기
    const rect = imageElement.getBoundingClientRect();
    
    // 이미지 내부에서의 클릭 위치 계산 (이미지 좌상단 기준)
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;
    
    // 이미지의 화면 표시 크기와 원본 크기 비율 계산
    const scaleX = imageElement.naturalWidth / imageElement.clientWidth;
    const scaleY = imageElement.naturalHeight / imageElement.clientHeight;
    
    // 서명 필드 크기 (화면 표시 기준)
    const signatureWidth = 150; // 화면에 표시될 서명 너비
    const signatureHeight = 80; // 화면에 표시될 서명 높이
    
    // 클릭한 지점을 중앙으로 하는 서명 필드 화면 좌표 계산
    const centeredDisplayX = offsetX - (signatureWidth / 2);
    const centeredDisplayY = offsetY - (signatureHeight / 2);
    
    // 화면 표시 좌표가 이미지 경계를 벗어나지 않도록 조정
    const imageWidth = imageElement.clientWidth;
    const imageHeight = imageElement.clientHeight;
    const adjustedDisplayX = Math.max(0, Math.min(centeredDisplayX, imageWidth - signatureWidth));
    const adjustedDisplayY = Math.max(0, Math.min(centeredDisplayY, imageHeight - signatureHeight));
    
    // 원본 이미지 기준 좌표 계산 (서명 저장 및 렌더링에 사용)
    const originalX = Math.round(adjustedDisplayX * scaleX);
    const originalY = Math.round(adjustedDisplayY * scaleY);
    const originalWidth = Math.round(signatureWidth * scaleX);
    const originalHeight = Math.round(signatureHeight * scaleY);
    
    // 디버깅 정보 출력
    console.log('클릭 이벤트 정보:');
    console.log(`- 이미지 실제 크기: ${imageElement.naturalWidth} x ${imageElement.naturalHeight}`);
    console.log(`- 이미지 화면 크기: ${imageWidth} x ${imageHeight}`);
    console.log(`- 비율: scaleX=${scaleX.toFixed(2)}, scaleY=${scaleY.toFixed(2)}`);
    console.log(`- 이미지 내 클릭 위치: ${offsetX.toFixed(2)}, ${offsetY.toFixed(2)}`);
    console.log(`- 중앙 보정 위치: ${centeredDisplayX.toFixed(2)}, ${centeredDisplayY.toFixed(2)}`);
    console.log(`- 조정된 화면 위치: ${adjustedDisplayX.toFixed(2)}, ${adjustedDisplayY.toFixed(2)}`);
    console.log(`- 원본 이미지 기준 위치: ${originalX}, ${originalY}, ${originalWidth} x ${originalHeight}`);
    
    // 새로운 서명 위치 객체 생성
    const newPosition = {
      id: `${Date.now()}`, // 고유 ID 생성
      x: originalX, // 원본 이미지 기준 X 좌표
      y: originalY, // 원본 이미지 기준 Y 좌표
      width: originalWidth, // 원본 이미지 기준 너비
      height: originalHeight, // 원본 이미지 기준 높이
      displayX: adjustedDisplayX, // 화면 표시용 X 좌표 (스타일 적용)
      displayY: adjustedDisplayY, // 화면 표시용 Y 좌표 (스타일 적용)
      displayWidth: signatureWidth, // 화면 표시용 너비
      displayHeight: signatureHeight, // 화면 표시용 높이
      signed: false, // 초기 상태는 서명되지 않음
    };
    
    // 새로운 서명 위치 추가
    const newDocuments = [...documents];
    const docIndex = newDocuments.findIndex(doc => doc.id === currentDocIndex + 1);
    
    if (docIndex !== -1) {
      newDocuments[docIndex].signaturePositions.push(newPosition);
      setDocuments(newDocuments);
      
      // 세션 스토리지 업데이트
      try {
        sessionStorage.setItem('signedDocuments', JSON.stringify(newDocuments));
        console.log('서명 필드 위치 저장 완료');
      } catch (err) {
        console.error('세션 스토리지 업데이트 오류:', err);
      }
    } else {
      console.error(`문서 인덱스 ${currentDocIndex + 1}에 해당하는 문서를 찾을 수 없습니다.`);
      console.log('현재 문서 배열:', documents.map(doc => doc.id));
    }
    
    addError('success', '서명 위치가 추가되었습니다.', true, 2000);
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
  
  // 서명된 문서 저장 함수 개선
  const saveSignedDocumentForDownload = () => {
    try {
      console.log('서명된 문서 저장 시작...');
      
      // 모든 문서가 서명되었는지 확인
      const allDocumentsSigned = documents.every((doc) => {
        const positions = doc.signaturePositions;
        return positions.length > 0 && positions.some((pos) => signaturePositions[pos.id]);
      });
      
      if (!allDocumentsSigned) {
        alert('모든 문서에 최소 하나 이상의 서명이 필요합니다.');
        return false;
      }
      
      // 서명 데이터 가져오기
      let signatureData = signatureImage;
      if (!signatureData) {
        // 세션 스토리지에서 서명 가져오기 시도
        const storedSignature = sessionStorage.getItem('userSignature');
        if (storedSignature) {
          signatureData = storedSignature;
          console.log('세션 스토리지에서 서명 복원 성공');
        } else {
          console.error('서명 데이터를 찾을 수 없습니다.');
          alert('서명이 완료되지 않았습니다. 서명을 추가해주세요.');
          return false;
        }
      }
      
      // 저장할 문서 정보 생성
      const documentsToSave = documents.map((doc) => {
        // 문서의 서명 위치 정보 처리
        const updatedPositions = doc.signaturePositions.map((pos) => ({
          ...pos,
          signed: signaturePositions[pos.id] || false
        }));
        
        console.log(`문서 ${doc.id}의 서명 위치 수: ${updatedPositions.length}`);
        console.log(`서명된 위치 수: ${updatedPositions.filter(pos => pos.signed).length}`);
        
        // 문서 객체 복사 후 서명 위치 정보 추가
        return {
          ...doc,
          signaturePositions: updatedPositions
        };
      });
      
      console.log(`저장할 문서 수: ${documentsToSave.length}`);
      
      // 문서 정보와 서명 이미지를 로컬 스토리지에 저장
      try {
        localStorage.setItem('signedDocumentsForDownload', JSON.stringify(documentsToSave));
        localStorage.setItem('userSignatureForDownload', signatureData);
        console.log('서명된 문서 정보 저장 완료');
        return true;
      } catch (storageError) {
        console.error('로컬 스토리지 저장 오류:', storageError);
        alert('서명 정보 저장에 실패했습니다. 다시 시도해주세요.');
        return false;
      }
    } catch (error) {
      console.error('서명 저장 중 오류 발생:', error);
      alert('서명 정보 처리 중 오류가 발생했습니다.');
      return false;
    }
  };
  
  // goToNextDocument 함수 간소화
  const goToNextDocument = () => {
    if (!isCurrentDocumentFullySigned()) {
      addError('warning', '모든 서명 위치에 서명을 추가해주세요.', true, 3000);
      return;
    }
    
    // 로컬 스토리지에 저장
    saveSignedDocumentForDownload();
    
    if (currentDocIndex < totalDocuments - 1) {
      setCurrentDocIndex(prev => prev + 1);
      addError('info', `${currentDocIndex + 2}번째 문서로 이동합니다.`, true, 2000);
    } else {
      // 모든 문서에 서명 완료
      addError('success', '모든 문서에 서명이 완료되었습니다.', true, 3000);
      
      // 서명 완료 정보 저장 (간소화)
      sessionStorage.setItem('documentsSignedCount', totalDocuments.toString());
      sessionStorage.setItem('documentsSignedDate', new Date().toISOString());
      
      // 서명된 문서 정보 저장 (간소화)
      const signedDocuments = documents.map(doc => {
        return {
          id: doc.id,
          imageUrl: doc.imageUrl,
          pdfUrl: doc.pdfUrl,
          type: doc.type,
          signaturePositions: doc.signaturePositions.map(pos => ({
            ...pos,
            signed: signaturePositions[pos.id] || false
          }))
        };
      });
      
      // 세션 및 로컬 스토리지에 저장
      sessionStorage.setItem('signedDocuments', JSON.stringify(signedDocuments));
      localStorage.setItem('signedDocumentsForDownload', JSON.stringify(signedDocuments));
      localStorage.setItem('userSignatureForDownload', signatureImage || sessionStorage.getItem('userSignature') || '');
      localStorage.setItem('hasSignature', 'true');
      
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
      return positions.length === 0 || positions.every(pos => signaturePositions[pos.id]);
    });
  };
  
  // 커스텀 모드 전환
  const toggleCustomMode = () => {
    setIsCustomMode(prev => !prev);
    addError('info', isCustomMode ? '기본 서명 모드로 전환합니다.' : '커스텀 서명 모드로 전환합니다. 문서를 클릭하여 서명 위치를 추가하세요.', true, 3000);
  };
  
  // 서명 핸들러
  const handleSignatureButtonClick = (positionId: string) => {
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
                  onClick={(e) => {
                    e.stopPropagation(); // 이벤트 버블링 방지
                    handleDocumentClick(e);
                  }}
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
                        className="bg-white"
                        onClick={(e) => {
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
                    // 서명 필드가 이미 있는 경우 해당 이벤트는 위에서 처리되므로 여기서는 무시됨
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