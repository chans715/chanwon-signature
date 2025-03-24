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
    
    // 캔버스 배경을 투명하게 설정
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    setCtx(context);

    // 화면 크기 변경 시 캔버스 크기 조정
    const handleResize = () => {
      const currentImage = canvas.toDataURL('image/png');
      
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      
      context.lineWidth = 2.5;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.strokeStyle = '#000000';
      
      // 이미지 복원
      const img = new Image();
      img.onload = () => {
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = currentImage;
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
    if (!canvasRef.current) return;
    
    if (!hasDrawn) {
      addError('warning', '서명을 입력해주세요.', true, 3000);
      return;
    }
    
    // PNG 형식으로 투명 배경과 함께 저장
    const signatureData = canvasRef.current.toDataURL('image/png');
    if (onSave) {
      onSave(signatureData);
    }
    
    // 이미 저장된 상태가 아닐 때만 상태 업데이트
    if (!isSaved) {
      setIsSaved(true);
      // 성공 메시지는 부모 컴포넌트에서 처리하도록 함
    }
    
    // 서명 데이터를 세션 스토리지에 저장
    sessionStorage.setItem('userSignature', signatureData);
  }, [hasDrawn, isSaved, onSave, addError]);

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
            border: '1px dashed #e5e7eb'
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
      </div>
      
      <div className="flex justify-center space-x-4 mt-6">
        <Button
          onClick={clearCanvas}
          variant="outline"
          size="sm"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          }
        >
          지우기
        </Button>
        <Button
          onClick={saveSignature}
          variant={isSaved ? "success" : "primary"}
          size="sm"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
          }
        >
          {isSaved ? '다시 저장' : '저장'}
        </Button>
      </div>
    </div>
  );
};

export default SignaturePadClient; 