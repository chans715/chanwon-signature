'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useError } from './ErrorHandler';
import Button from '@/components/ui/Button';

interface SignaturePadClientProps {
  onSave?: (signatureData: string) => void;
  onSignatureStatusChange?: (isSaved: boolean) => void;
}

const SignaturePadClient: React.FC<SignaturePadClientProps> = ({ 
  onSave, 
  onSignatureStatusChange 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const prevSavedRef = useRef(false);
  const { addError } = useError();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return;

    // 캔버스 크기 설정
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // 컨텍스트 설정
    context.lineWidth = 2.5;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = '#000000';
    
    // 캔버스 배경을 투명하게 설정 - 배경 채우기 제거
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    setCtx(context);

    // 화면 크기 변경 시 캔버스 크기 조정
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas || !ctx) return;
      
      const currentImage = canvas.toDataURL('image/png');
      
      const oldWidth = canvas.width;
      const oldHeight = canvas.height;
      
      // 새 크기로 설정
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      
      // 컨텍스트 설정 복원 (리사이즈 시 초기화됨)
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#000000';
      
      if (hasDrawn) {
        // 이미지 복원
        const img = new Image();
        img.onload = () => {
          // 배경 지우기
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          // 이미지 그리기
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = currentImage;
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 서명 상태가 변경될 때마다 부모 컴포넌트에 알림
  useEffect(() => {
    // 이전 상태와 현재 상태가 다를 때만 콜백 호출
    if (prevSavedRef.current !== isSaved && onSignatureStatusChange) {
      onSignatureStatusChange(isSaved);
    }
    
    // 현재 상태를 이전 상태로 업데이트
    prevSavedRef.current = isSaved;
  }, [isSaved, onSignatureStatusChange]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    
    if (!ctx) return;
    
    ctx.beginPath();
    
    // 마우스 또는 터치 이벤트 처리
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !ctx) return;
    
    // 마우스 또는 터치 이벤트 처리
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
    
    // 서명을 수정하면 저장 상태 초기화 (이미 저장된 상태인 경우에만)
    if (isSaved) {
      setIsSaved(false);
    }
    
    // 아직 그리지 않은 상태라면 그렸음을 표시
    if (!hasDrawn) {
      setHasDrawn(true);
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (!ctx) return;
    ctx.closePath();
  };

  const clearCanvas = useCallback(() => {
    if (!ctx || !canvasRef.current) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setHasDrawn(false);
    setIsSaved(false);
  }, [ctx]);

  const saveSignature = useCallback(() => {
    if (!canvasRef.current) {
      console.error('캔버스 참조를 찾을 수 없습니다.');
      return;
    }
    
    if (!hasDrawn) {
      addError('warning', '서명을 입력해주세요.', true, 3000);
      return;
    }
    
    try {
      console.log('서명 저장 시도...');
      
      // 캔버스의 실제 내용이 있는 영역만 계산 (여백 줄이기)
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) {
        throw new Error('캔버스 컨텍스트를 가져올 수 없습니다.');
      }
      
      // PNG 형식으로 투명 배경과 함께 저장
      const signatureData = canvas.toDataURL('image/png');
      console.log('서명 데이터 생성 성공 (길이):', signatureData.length);
      
      if (onSave) {
        onSave(signatureData);
      }
      
      // 이미 저장된 상태가 아닐 때만 상태 업데이트
      if (!isSaved) {
        setIsSaved(true);
      }
      
      // 서명 데이터를 세션 스토리지에 저장하기 전에 로컬 변수에 보관
      const signatureToStore = signatureData;
      
      try {
        // 세션 스토리지에 저장하기 전에 기존 데이터 삭제
        sessionStorage.removeItem('userSignature');
        
        // 새 데이터 저장
        sessionStorage.setItem('userSignature', signatureToStore);
        console.log('세션 스토리지에 서명 저장 성공');
        
        // 저장 확인
        const savedData = sessionStorage.getItem('userSignature');
        if (savedData) {
          if (savedData.length > 0) {
            console.log('세션 스토리지 저장 확인 완료 (데이터 길이):', savedData.length);
          } else {
            console.warn('세션 스토리지 저장 확인 실패 (데이터가 비어있음)');
            // 다시 저장 시도
            sessionStorage.setItem('userSignature', signatureToStore);
          }
        } else {
          console.warn('세션 스토리지 저장 확인 실패 (데이터 없음)');
          // 다시 저장 시도
          sessionStorage.setItem('userSignature', signatureToStore);
        }
        
        // 전역 window에도 저장 (세션 스토리지가 실패할 경우 대비)
        // @ts-ignore
        window.__signature = signatureToStore;
        
      } catch (storageError) {
        console.error('세션 스토리지 저장 오류:', storageError);
        addError('error', '서명 저장 중 오류가 발생했습니다. 다시 시도해주세요.', true, 3000);
        
        // 전역 window에 백업 저장
        try {
          // @ts-ignore
          window.__signature = signatureToStore;
          console.log('window 객체에 서명 백업 저장 성공');
        } catch (backupError) {
          console.error('백업 저장 실패:', backupError);
        }
      }
    } catch (error) {
      console.error('서명 저장 중 오류:', error);
      addError('error', '서명 데이터 생성 중 오류가 발생했습니다. 다시 시도해주세요.', true, 3000);
    }
  }, [hasDrawn, isSaved, onSave, addError, canvasRef]);

  return (
    <div className="w-full">
      <div className="relative">
        <canvas
          ref={canvasRef}
          className={`signature-pad w-full h-56 rounded-lg transition-all duration-200 ${
            isSaved 
              ? 'shadow-[0_0_0_2px_rgba(34,197,94,0.6)]' 
              : hasDrawn 
                ? 'shadow-[0_0_0_2px_rgba(59,130,246,0.6)]' 
                : 'shadow-[0_0_0_1px_rgba(209,213,219,0.6)]'
          }`}
          style={{ 
            background: 'transparent',
            touchAction: 'none',
          }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        
        {!hasDrawn && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-400 text-sm">
            여기에 서명하세요
          </div>
        )}
        
        {isSaved && (
          <div className="absolute top-3 right-3 bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            저장됨
          </div>
        )}

        {/* 서명 안내선 */}
        <div className="absolute bottom-10 left-0 right-0 border-t border-dashed border-gray-300 pointer-events-none opacity-30"></div>
      </div>
      
      <div className="flex justify-between mt-4 gap-2">
        <Button 
          onClick={clearCanvas}
          variant="outline"
          size="sm"
        >
          지우기
        </Button>
        <Button 
          onClick={saveSignature}
          variant={hasDrawn ? "primary" : "secondary"}
          size="sm"
          disabled={!hasDrawn}
        >
          저장
        </Button>
      </div>
    </div>
  );
};

export default SignaturePadClient; 