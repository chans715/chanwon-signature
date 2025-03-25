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
  const [signedPositions, setSignedPositions] = useState<Record<string, boolean>>({});
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
        setSignedPositions(loadedSignedPositions);
        
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
      const newSignedPositions = { ...signedPositions };
      newSignedPositions[positionId] = true;
      
      // 서명 위치 상태 업데이트
      setSignedPositions(newSignedPositions);
      console.log('서명 위치 상태 업데이트:', newSignedPositions);
      
      // 문서 상태 업데이트 준비
      const newDocuments = [...documents];
      
      // 문서 ID가 아닌 인덱스로 문서 찾기
      let docIndex = -1;
      
      // 현재 보고 있는 문서 인덱스로 찾기
      if (currentDocIndex >= 0 && currentDocIndex < newDocuments.length) {
        docIndex = currentDocIndex;
      } else {
        // ID로 찾기 (이전 로직)
        docIndex = newDocuments.findIndex(doc => doc.id === currentDocIndex + 1);
      }
      
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
            signed: pos.id === positionId
          }))
        };
        newDocuments.push(newDoc);
        console.log('추가된 문서:', newDoc);
      } else {
        // 기존 문서 업데이트 - 현재 문서의 서명 위치만 업데이트
        console.log('기존 문서 업데이트:', docIndex, currentDocIndex + 1);
        
        // 현재 문서의 서명 위치 가져오기
        const currentPositions = [...newDocuments[docIndex].signaturePositions];
        
        // 서명 위치 업데이트
        const updatedPositions = currentPositions.map(pos => ({
          ...pos,
          // 현재 클릭한 위치만 signed 상태 변경
          signed: pos.id === positionId ? true : pos.signed
        }));
        
        // 문서 업데이트
        newDocuments[docIndex] = {
          ...newDocuments[docIndex],
          signaturePositions: updatedPositions
        };
        
        console.log('업데이트된 문서 서명 위치:', updatedPositions);
      }
      
      // 문서 상태 업데이트
      setDocuments(newDocuments);
      
      // 서명된 문서 정보를 세션 스토리지에 저장
      try {
        const serializedData = JSON.stringify(newDocuments);
        sessionStorage.setItem('signedDocuments', serializedData);
        
        // 서명 상태도 별도로 저장
        sessionStorage.setItem('signedPositions', JSON.stringify(newSignedPositions));
        
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
  
  // 문서에 클릭하여 서명 위치 추가
  const handleDocumentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // 이미지 요소 찾기 및 크기 비율 계산
    const imageElement = e.currentTarget.querySelector('img') as HTMLImageElement;
    if (!imageElement) {
      console.error('이미지 요소를 찾을 수 없습니다.');
      return;
    }
    
    // 이미지의 원본 크기와 표시 크기 가져오기
    const displayWidth = imageElement.clientWidth;
    const displayHeight = imageElement.clientHeight;
    
    // 원본 이미지 가져오기 (자연 크기)
    const naturalWidth = imageElement.naturalWidth || displayWidth;
    const naturalHeight = imageElement.naturalHeight || displayHeight;
    
    // 크기 비율 계산
    const widthRatio = naturalWidth / displayWidth;
    const heightRatio = naturalHeight / displayHeight;
    
    // 이미지 컨테이너와 이미지 자체의 위치 계산
    const containerRect = e.currentTarget.getBoundingClientRect();
    const imageRect = imageElement.getBoundingClientRect();
    
    // 클릭한 위치 계산 (컨테이너 기준)
    const clickX = e.clientX - containerRect.left;
    const clickY = e.clientY - containerRect.top;
    
    // 이미지 내부 클릭 위치 계산 (이미지 기준)
    let imageClickX = clickX - (imageRect.left - containerRect.left);
    let imageClickY = clickY - (imageRect.top - containerRect.top);
    
    // 이미지 외부 클릭 체크
    if (imageClickX < 0 || imageClickX > displayWidth || imageClickY < 0 || imageClickY > displayHeight) {
      console.warn('이미지 외부를 클릭했습니다. 위치를 조정합니다.');
      imageClickX = Math.max(0, Math.min(imageClickX, displayWidth));
      imageClickY = Math.max(0, Math.min(imageClickY, displayHeight));
    }
    
    // 원본 좌표와 화면 표시용 좌표 모두 계산
    const originalX = Math.round(imageClickX * widthRatio); // 원본 이미지 기준 X 좌표
    const originalY = Math.round(imageClickY * heightRatio); // 원본 이미지 기준 Y 좌표
    
    // 서명 필드 크기 (원본과 화면 표시용 모두 계산)
    const originalWidth = Math.round(150 * widthRatio); // 원본 이미지 기준 너비
    const originalHeight = Math.round(60 * heightRatio); // 원본 이미지 기준 높이
    const displayFieldWidth = 150; // 화면 표시용 너비
    const displayFieldHeight = 60; // 화면 표시용 높이
    
    console.log(`클릭 좌표: 화면(${imageClickX}, ${imageClickY}) -> 원본(${originalX}, ${originalY})`);
    console.log(`이미지 크기: 화면(${displayWidth}x${displayHeight}) 원본(${naturalWidth}x${naturalHeight})`);
    console.log(`변환 비율: 가로(${widthRatio.toFixed(2)}) 세로(${heightRatio.toFixed(2)})`);
    
    // 새 서명 위치 ID 생성
    const newPositionId = `${isCustomMode ? 'custom' : 'default'}-${currentDocIndex}-${Date.now()}`;
    
    // 현재 문서의 서명 위치 배열 복사
    let updatedPositions;
    
    if (isCustomMode) {
      // 커스텀 모드에서는 customSignaturePositions 배열 사용
      updatedPositions = [...customSignaturePositions];
      if (!updatedPositions[currentDocIndex]) {
        updatedPositions[currentDocIndex] = [];
      }
      
      // 새 서명 위치 추가 (원본 및 표시용 정보 포함)
      updatedPositions[currentDocIndex].push({
        id: newPositionId,
        x: originalX, // 원본 이미지 기준 X
        y: originalY, // 원본 이미지 기준 Y
        width: originalWidth, // 원본 이미지 기준 너비
        height: originalHeight, // 원본 이미지 기준 높이
        displayX: imageClickX, // 화면 표시용 X
        displayY: imageClickY, // 화면 표시용 Y
        displayWidth: displayFieldWidth, // 화면 표시용 너비
        displayHeight: displayFieldHeight, // 화면 표시용 높이
      });
      
      setCustomSignaturePositions(updatedPositions);
    } else {
      // 기본 모드에서는 documents 배열 직접 수정
      const newDocuments = [...documents];
      const docIndex = newDocuments.findIndex(doc => doc.id === currentDocIndex + 1);
      
      if (docIndex !== -1) {
        // 새 서명 위치 추가 (원본 및 표시용 정보 포함)
        const newPosition = {
          id: newPositionId,
          x: originalX, // 원본 이미지 기준 X
          y: originalY, // 원본 이미지 기준 Y
          width: originalWidth, // 원본 이미지 기준 너비
          height: originalHeight, // 원본 이미지 기준 높이
          displayX: imageClickX, // 화면 표시용 X
          displayY: imageClickY, // 화면 표시용 Y
          displayWidth: displayFieldWidth, // 화면 표시용 너비
          displayHeight: displayFieldHeight, // 화면 표시용 높이
          signed: false
        };
        
        newDocuments[docIndex].signaturePositions.push(newPosition);
        setDocuments(newDocuments);
        
        // 세션 스토리지 업데이트
        try {
          sessionStorage.setItem('signedDocuments', JSON.stringify(newDocuments));
        } catch (err) {
          console.error('세션 스토리지 업데이트 오류:', err);
        }
      }
    }
    
    addError('success', '서명 위치가 추가되었습니다.', true, 2000);
  };
  
  // 서명 위치 삭제
  const removeSignaturePosition = (positionId: string) => {
    console.log('서명 위치 삭제 시도:', positionId);
    
    // 커스텀 모드에서만 직접 서명 위치를 삭제 가능
    if (isCustomMode) {
      const updatedPositions = [...customSignaturePositions];
      if (updatedPositions[currentDocIndex]) {
        updatedPositions[currentDocIndex] = updatedPositions[currentDocIndex].filter(
          pos => pos.id !== positionId
        );
        setCustomSignaturePositions(updatedPositions);
        
        // 서명도 함께 삭제
        if (signedPositions[positionId]) {
          const updatedSignedPositions = { ...signedPositions };
          delete updatedSignedPositions[positionId];
          setSignedPositions(updatedSignedPositions);
          
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
              sessionStorage.setItem('signedPositions', JSON.stringify(updatedSignedPositions));
            } catch (err) {
              console.error('세션 스토리지 업데이트 오류:', err);
            }
          }
        }
        
        addError('info', '서명 위치가 삭제되었습니다.', true, 2000);
      }
    } else {
      // 기본 모드에서는 서명만 삭제하고 위치는 유지
      if (signedPositions[positionId]) {
        const updatedSignedPositions = { ...signedPositions };
        delete updatedSignedPositions[positionId];
        setSignedPositions(updatedSignedPositions);
        
        // 문서의 서명 상태만 업데이트
        const newDocuments = [...documents];
        const docIndex = newDocuments.findIndex(doc => doc.id === currentDocIndex + 1);
        
        if (docIndex !== -1) {
          const updatedPositions = newDocuments[docIndex].signaturePositions.map(pos => {
            if (pos.id === positionId) {
              return { ...pos, signed: false };
            }
            return pos;
          });
          
          newDocuments[docIndex] = {
            ...newDocuments[docIndex],
            signaturePositions: updatedPositions
          };
          
          setDocuments(newDocuments);
          
          // 세션 스토리지 업데이트
          try {
            sessionStorage.setItem('signedDocuments', JSON.stringify(newDocuments));
            sessionStorage.setItem('signedPositions', JSON.stringify(updatedSignedPositions));
          } catch (err) {
            console.error('세션 스토리지 업데이트 오류:', err);
          }
        }
        
        addError('info', '서명이 삭제되었습니다.', true, 2000);
      }
    }
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
  
  // 서명된 문서 다운로드를 위한 처리 간소화
  const saveSignedDocumentForDownload = () => {
    // 서명 이미지 가져오기
    const signature = signatureImage || sessionStorage.getItem('userSignature');
    
    if (!signature) {
      console.error('서명 이미지를 찾을 수 없습니다');
      addError('error', '서명 이미지를 찾을 수 없습니다. 서명을 다시 입력해주세요.', true, 3000);
      return;
    }

    // 서명된 문서 정보 저장 (간소화)
    const signedDocuments = documents.map((doc, index) => {
      const actualSignaturePositions = isCustomMode ? customSignaturePositions[index] : doc.signaturePositions;
      
      // 서명 위치 정보 정확히 저장하기
      const positions = actualSignaturePositions.map(pos => {
        const isPositionSigned = signedPositions[pos.id] || false;
        // 디버깅 정보 출력
        if (isPositionSigned) {
          console.log(`저장하는 서명 위치: ID=${pos.id}, x=${pos.x}, y=${pos.y}, 너비=${pos.width}, 높이=${pos.height}`);
        }
        
        // display 관련 필드는 제외하고 필요한 필드만 포함
        return {
          id: pos.id,
          x: pos.x,
          y: pos.y,
          width: pos.width,
          height: pos.height,
          signed: isPositionSigned,
          signatureImage: isPositionSigned ? signature : null
        };
      });
      
      return {
        id: doc.id,
        imageUrl: doc.imageUrl,
        pdfUrl: doc.pdfUrl,
        type: doc.type,
        signaturePositions: positions,
        signatureImage: signature
      };
    });
    
    // 로컬 스토리지에 저장
    try {
      console.log('서명된 문서 정보:', JSON.stringify(signedDocuments, null, 2));
      localStorage.setItem('signedDocumentsForDownload', JSON.stringify(signedDocuments));
      localStorage.setItem('userSignatureForDownload', signature);
      localStorage.setItem('hasSignature', 'true');
    } catch (err) {
      console.error('로컬 스토리지 저장 오류:', err);
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
            signed: signedPositions[pos.id] || false
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
      return positions.length === 0 || positions.every(pos => signedPositions[pos.id]);
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
                      : '문서를 클릭하여 원하는 위치에 서명 필드를 추가하세요. 서명된 필드를 클릭하면 서명이 삭제됩니다.'}
                  </p>
                </div>
              </div>
            </div>
            
            <div 
              className="relative border border-gray-300 rounded-md mb-6 overflow-hidden"
              onClick={handleDocumentClick}
              style={{ cursor: 'crosshair' }}
              onMouseMove={handleDragMove}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
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
                        signedPositions[position.id] ? 'border-green-500 bg-green-50/30' : 'border-red-500 animate-pulse'
                      } rounded-md flex items-center justify-center`}
                      style={{
                        left: `${position.displayX !== undefined ? position.displayX : position.x}px`,
                        top: `${position.displayY !== undefined ? position.displayY : position.y}px`,
                        width: `${position.displayWidth !== undefined ? position.displayWidth : 150}px`,
                        height: `${position.displayHeight !== undefined ? position.displayHeight : 60}px`,
                      }}
                      onClick={(e) => {
                        if (isCustomMode) {
                          // 직접서명위치지정 모드에서는 클릭시 바로 삭제
                          e.stopPropagation();
                          removeSignaturePosition(position.id);
                        } else if (!signedPositions[position.id]) {
                          // 기본 모드에서는 서명되지 않은 위치만 클릭시 서명 추가
                          e.stopPropagation();
                          handleSignatureButtonClick(position.id);
                        } else {
                          // 기본 모드에서 서명된 위치 클릭시 이벤트 전파만 중지 (삭제 기능 제거)
                          e.stopPropagation();
                        }
                      }}
                      onMouseDown={(e) => handleDragStart(e, position.id)}
                    >
                      {signedPositions[position.id] ? (
                        <img 
                          src={signatureImage || ''} 
                          alt="서명" 
                          style={{ 
                            width: `${(position.displayWidth !== undefined ? position.displayWidth : 150) - 10}px`,
                            height: `${(position.displayHeight !== undefined ? position.displayHeight : 60) - 10}px`,
                            objectFit: 'contain',
                            background: 'transparent'
                          }}
                        />
                      ) : (
                        <div className="relative w-full h-full flex items-center justify-center">
                          <span className="text-xs text-red-500 font-medium">서명 필요</span>
                          {/* 직접서명위치지정 모드에서만 삭제 버튼 표시 */}
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
                        signedPositions[position.id] ? 'border-green-500 bg-green-50/30' : 'border-red-500 animate-pulse'
                      } rounded-md flex items-center justify-center z-10`}
                      style={{
                        left: `${position.displayX !== undefined ? position.displayX : position.x}px`,
                        top: `${position.displayY !== undefined ? position.displayY : position.y}px`,
                        width: `${position.displayWidth !== undefined ? position.displayWidth : 150}px`,
                        height: `${position.displayHeight !== undefined ? position.displayHeight : 60}px`,
                      }}
                      onClick={(e) => {
                        if (isCustomMode) {
                          // 직접서명위치지정 모드에서는 클릭시 바로 삭제
                          e.stopPropagation();
                          removeSignaturePosition(position.id);
                        } else if (!signedPositions[position.id]) {
                          // 기본 모드에서는 서명되지 않은 위치만 클릭시 서명 추가
                          e.stopPropagation();
                          handleSignatureButtonClick(position.id);
                        } else {
                          // 기본 모드에서 서명된 위치 클릭시 이벤트 전파만 중지 (삭제 기능 제거)
                          e.stopPropagation();
                        }
                      }}
                      onMouseDown={(e) => handleDragStart(e, position.id)}
                    >
                      {signedPositions[position.id] ? (
                        <img 
                          src={signatureImage || ''} 
                          alt="서명" 
                          style={{ 
                            width: `${(position.displayWidth !== undefined ? position.displayWidth : 150) - 10}px`,
                            height: `${(position.displayHeight !== undefined ? position.displayHeight : 60) - 10}px`,
                            objectFit: 'contain',
                            background: 'transparent'
                          }}
                        />
                      ) : (
                        <div className="relative w-full h-full flex items-center justify-center">
                          <span className="text-xs text-red-500 font-medium">서명 필요</span>
                          {/* 직접서명위치지정 모드에서만 삭제 버튼 표시 */}
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
                      onClick={() => handleSignatureButtonClick(position.id)}
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