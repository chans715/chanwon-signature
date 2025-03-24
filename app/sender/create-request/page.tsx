'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useError } from '@/components/ErrorHandler';
import Container from '@/components/ui/Container';
import Card, { CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import SenderInfoEditor, { SenderInfo } from '@/components/SenderInfoEditor';
import Link from 'next/link';
import Layout from '@/components/Layout';

export default function CreateRequest() {
  const router = useRouter();
  const { addError } = useError();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 기본 폼 데이터
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    recipientName: '',
    recipientPhone: '',
    expiryDate: ''
  });
  
  const [senderInfo, setSenderInfo] = useState<SenderInfo | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  
  const [signaturePositions, setSignaturePositions] = useState<Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    name: string;
  }>>([]);
  
  // 문서 미리보기를 위한 상태 추가
  const [selectedDocumentPreview, setSelectedDocumentPreview] = useState<string | null>(null);
  
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  const [currentDocumentIndex, setCurrentDocumentIndex] = useState(0);
  const [documentPreviews, setDocumentPreviews] = useState<string[]>([]);
  const [signaturePositionsPerDoc, setSignaturePositionsPerDoc] = useState<Array<Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    name: string;
  }>>>([]);
  
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showNoSignatureConfirm, setShowNoSignatureConfirm] = useState(false);
  
  const [resizingField, setResizingField] = useState<number | null>(null);
  const [resizeStartPos, setResizeStartPos] = useState<{x: number, y: number} | null>(null);
  
  // 드래그를 위한 상태 변수 추가
  const [draggingField, setDraggingField] = useState<number | null>(null);
  const [dragStartPos, setDragStartPos] = useState<{x: number, y: number} | null>(null);
  const [fieldOffset, setFieldOffset] = useState<{x: number, y: number} | null>(null);
  
  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^[0-9]{11}$/;
    return phoneRegex.test(phone);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === 'recipientPhone' && value.length > 0) {
      if (!validatePhoneNumber(value)) {
        setErrorMessage('전화번호는 11자리 숫자여야 합니다.');
      } else {
        setErrorMessage('');
      }
    }
  };
  
  const handleNextStep = () => {
    if (currentStep === 1) {
      const { title, recipientName, recipientPhone } = formData;
      if (!title || !recipientName || !recipientPhone) {
        setErrorMessage('모든 필수 필드를 입력해주세요.');
        return;
      }
      if (!validatePhoneNumber(recipientPhone)) {
        setErrorMessage('전화번호는 11자리 숫자여야 합니다.');
        return;
      }
    } else if (currentStep === 2) {
      if (uploadedFiles.length === 0) {
        addError('warning', '최소한 하나의 문서를 업로드하세요.', true, 3000);
        return;
      }
    } else if (currentStep === 3) {
      // 서명 필드가 없는 문서가 있는지 확인
      const hasUnsignedDoc = signaturePositionsPerDoc.some((positions, index) => 
        documentPreviews[index] && (!positions || positions.length === 0)
      );
      
      if (hasUnsignedDoc) {
        setShowNoSignatureConfirm(true);
        return;
      }
    }
    
    setCurrentStep(prev => prev + 1);
  };
  
  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };
  
  const handleSenderInfoSave = (info: SenderInfo) => {
    setSenderInfo(info);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setUploadedFiles(prev => [...prev, ...Array.from(files)]);
      
      Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e: ProgressEvent<FileReader>) => {
            const result = e.target?.result;
            if (result && typeof result === 'string') {
              setDocumentPreviews(prev => [...prev, result]);
              setSignaturePositionsPerDoc(prev => [...prev, []]);
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }
  };
  
  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileUpload = async () => {
    if (uploadedFiles.length === 0) {
      addError('warning', '업로드할 파일을 선택하세요.', true, 3000);
      return;
    }

    try {
      // 파일 업로드 API 호출 (여기서는 시뮬레이션)
      await new Promise(resolve => setTimeout(resolve, 1500));
      addError('success', '파일이 성공적으로 업로드되었습니다.', true, 3000);
    } catch (error) {
      addError('error', '파일 업로드 중 오류가 발생했습니다.', true, 5000);
    }
  };
  
  const handleDocumentClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!documentPreviews[currentDocumentIndex]) {
      addError('warning', '문서를 먼저 업로드하세요.', true, 3000);
      return;
    }
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const width = 180;
    const height = 60;
    
    if (e.target !== e.currentTarget) {
      e.stopPropagation();
      return;
    }
    
    const currentPositions = signaturePositionsPerDoc[currentDocumentIndex] || [];
    const isOverlapping = currentPositions.some(pos => {
      return !(x + width < pos.x || x > pos.x + pos.width || 
               y + height < pos.y || y > pos.y + pos.height);
    });

    if (!isOverlapping) {
      const newPositions = [...signaturePositionsPerDoc];
      newPositions[currentDocumentIndex] = [
        ...(newPositions[currentDocumentIndex] || []),
        { x, y, width, height, name: formData.recipientName }
      ];
      setSignaturePositionsPerDoc(newPositions);
    } else {
      addError('warning', '서명 필드가 겹칠 수 없습니다.', true, 3000);
    }
  };
  
  const handleSignatureFieldClick = (docIndex: number, fieldIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    // 리사이징 핸들을 클릭한 경우 삭제하지 않음
    const target = e.target as HTMLElement;
    if (target.classList.contains('resize-handle')) {
      return;
    }
    
    // 삭제 확인
    if (window.confirm('서명 필드를 삭제하시겠습니까?')) {
      const newPositions = [...signaturePositionsPerDoc];
      newPositions[docIndex] = newPositions[docIndex].filter((_, i) => i !== fieldIndex);
      setSignaturePositionsPerDoc(newPositions);
    }
  };
  
  const handleSignatureFieldMouseDown = (docIndex: number, fieldIndex: number, e: React.MouseEvent) => {
    // 리사이징 핸들을 클릭한 경우에만 리사이징 시작
    const target = e.target as HTMLElement;
    if (target.classList.contains('resize-handle')) {
      e.stopPropagation();
      setResizingField(fieldIndex);
      setResizeStartPos({
        x: e.clientX,
        y: e.clientY
      });
      e.preventDefault();
      return;
    }
    
    // 드래그 시작 - 필드 본체를 클릭한 경우
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDraggingField(fieldIndex);
    setDragStartPos({
      x: e.clientX,
      y: e.clientY
    });
    setFieldOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    // 리사이징 로직
    if (resizingField !== null && resizeStartPos) {
      const currentPositions = [...signaturePositionsPerDoc];
      const field = currentPositions[currentDocumentIndex][resizingField];
      
      const deltaX = e.clientX - resizeStartPos.x;
      const deltaY = e.clientY - resizeStartPos.y;
      
      // 최소 크기 제한
      const newWidth = Math.max(100, field.width + deltaX);
      const newHeight = Math.max(50, field.height + deltaY);
      
      field.width = newWidth;
      field.height = newHeight;
      
      setSignaturePositionsPerDoc(currentPositions);
      setResizeStartPos({
        x: e.clientX,
        y: e.clientY
      });
    }
    
    // 드래그 로직
    if (draggingField !== null && dragStartPos && fieldOffset) {
      const docContainer = document.getElementById('document-container');
      if (!docContainer) return;
      
      const containerRect = docContainer.getBoundingClientRect();
      const currentPositions = [...signaturePositionsPerDoc];
      const field = currentPositions[currentDocumentIndex][draggingField];
      
      // 마우스 위치에서 컨테이너 위치와 필드 내 오프셋을 고려하여 새 위치 계산
      let newX = e.clientX - containerRect.left - fieldOffset.x;
      let newY = e.clientY - containerRect.top - fieldOffset.y;
      
      // 컨테이너 경계 내로 제한
      newX = Math.max(0, Math.min(newX, containerRect.width - field.width));
      newY = Math.max(0, Math.min(newY, containerRect.height - field.height));
      
      field.x = newX;
      field.y = newY;
      
      setSignaturePositionsPerDoc(currentPositions);
    }
  };

  const handleMouseUp = () => {
    setResizingField(null);
    setResizeStartPos(null);
    setDraggingField(null);
    setDragStartPos(null);
    setFieldOffset(null);
  };

  useEffect(() => {
    if (resizingField !== null || draggingField !== null) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [resizingField, resizeStartPos, draggingField, dragStartPos, fieldOffset, currentDocumentIndex]);
  
  const renderSignatureFields = () => {
    const currentPositions = signaturePositionsPerDoc[currentDocumentIndex] || [];
    return currentPositions.map((pos, index) => (
      <div
        key={index}
        style={{
          position: 'absolute',
          left: pos.x,
          top: pos.y,
          width: pos.width,
          height: pos.height,
          border: '2px solid red',
          backgroundColor: 'rgba(255, 0, 0, 0.1)',
          cursor: draggingField === index ? 'grabbing' : 'grab',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '4px'
        }}
        onClick={(e) => handleSignatureFieldClick(currentDocumentIndex, index, e)}
        onMouseDown={(e) => handleSignatureFieldMouseDown(currentDocumentIndex, index, e)}
      >
        <div className="flex-1 text-center border-r border-red-300 pr-2 overflow-hidden whitespace-nowrap">
          <span className="text-xs font-medium overflow-hidden text-nowrap" style={{ display: 'inline-block', maxWidth: '100%' }}>
            {pos.name}
          </span>
        </div>
        <div className="flex-1 text-center pl-2 overflow-hidden whitespace-nowrap">
          <span className="text-xs overflow-hidden text-nowrap" style={{ display: 'inline-block', maxWidth: '100%' }}>서명란</span>
        </div>
        <div 
          className="resize-handle"
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: '14px',
            height: '14px',
            cursor: 'nwse-resize',
            backgroundColor: 'rgba(255, 0, 0, 0.3)',
            borderLeft: '2px solid red',
            borderTop: '2px solid red',
            zIndex: 10,
            borderTopLeftRadius: '3px'
          }}
          title="드래그하여 크기 조정"
        />
      </div>
    ));
  };
  
  // 문서 미리보기 영역에 문서 선택 컨트롤 추가
  const renderDocumentControls = () => {
    return (
      <div className="flex justify-between items-center mb-4">
        <button
          className="px-3 py-1 bg-gray-200 rounded-md disabled:opacity-50"
          onClick={() => setCurrentDocumentIndex(prev => prev - 1)}
          disabled={currentDocumentIndex === 0}
        >
          이전
        </button>
        <span className="text-sm">
          문서 {currentDocumentIndex + 1} / {documentPreviews.length}
        </span>
        <button
          className="px-3 py-1 bg-gray-200 rounded-md disabled:opacity-50"
          onClick={() => setCurrentDocumentIndex(prev => prev + 1)}
          disabled={currentDocumentIndex === documentPreviews.length - 1}
        >
          다음
        </button>
      </div>
    );
  };
  
  useEffect(() => {
    // 만료일을 오늘 날짜에서 +2일로 자동 설정
    const defaultExpiryDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, expiryDate: defaultExpiryDate }));
  }, []);
  
  const validateInputs = () => {
    const { title, recipientName, recipientPhone } = formData;
    if (!title || !recipientName || !recipientPhone) {
      addError('warning', '모든 필드를 입력해주세요.', true, 3000);
      return false;
    }
    if (uploadedFiles.length === 0) {
      addError('warning', '최소한 하나의 문서를 업로드하세요.', true, 3000);
      return false;
    }
    return true;
  };
  
  const handleFileDelete = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const sendKakaoNotification = async (recipientName: string, recipientPhone: string) => {
    try {
      // 실제 환경에서는 카카오 알림톡 API 호출이 필요
      // 현재는 시뮬레이션으로 대체
      await new Promise(resolve => setTimeout(resolve, 1000)); // API 호출 시뮬레이션
      
      // 카카오 알림톡 발송 로그
      console.log(`카카오 알림톡이 ${recipientName}님(${recipientPhone})에게 발송되었습니다.`);
      console.log(`내용: ${formData.title} 문서에 대한 서명 요청이 있습니다.`);
      
      // 알림톡 발송 성공 처리는 하지만 실제로는 발송되지 않음 (테스트 환경)
      return true;
    } catch (error) {
      console.error('카카오 알림톡 발송 중 오류가 발생했습니다.', error);
      // 실패해도 계속 진행
      return true;
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmDialog(true);
  };
  
  const handleConfirm = async () => {
    setShowConfirmDialog(false);
    setIsSubmitting(true);

    if (!validateInputs() || !senderInfo) {
      setIsSubmitting(false);
      return;
    }

    try {
      const requestId = `REQ-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      
      const newRequest = {
        id: requestId,
        title: formData.title,
        recipient: formData.recipientName,
        recipientEmail: '',
        recipientPhone: formData.recipientPhone,
        status: 'pending',
        createdAt: new Date().toISOString(),
        documentCount: uploadedFiles.length,
        message: formData.message,
        expiryDate: formData.expiryDate
      };
      
      // 세션 스토리지뿐만 아니라 로컬 스토리지에도 저장 (브라우저 새로고침 후에도 유지되도록)
      const sessionRequests = JSON.parse(sessionStorage.getItem('signature_requests') || '[]');
      sessionRequests.unshift(newRequest);
      sessionStorage.setItem('signature_requests', JSON.stringify(sessionRequests));
      
      // 로컬 스토리지에도 동일하게 저장
      const localRequests = JSON.parse(localStorage.getItem('signature_requests') || '[]');
      localRequests.unshift(newRequest);
      localStorage.setItem('signature_requests', JSON.stringify(localRequests));

      // 카카오톡 알림 전송 (실제로는 API를 호출해야 함)
      await sendKakaoNotification(formData.recipientName, formData.recipientPhone);
      
      // 발송 완료 다이얼로그 표시
      setShowSuccessDialog(true);
    } catch (error) {
      addError('error', '서명 요청 생성 중 오류가 발생했습니다.', true, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 발송 성공 확인 버튼 클릭 시 대시보드로 이동
  const handleSuccessConfirm = () => {
    setShowSuccessDialog(false);
    router.push('/sender/dashboard');
  };
  
  return (
    <Layout>
      <Container maxWidth="lg">
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-medium mb-4">확인</h3>
              <p className="text-gray-600 mb-6">수신인에게 전송하시겠습니까?</p>
              <div className="flex justify-end space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmDialog(false)}
                >
                  아니오
                </Button>
                <Button
                  variant="primary"
                  onClick={handleConfirm}
                  loading={isSubmitting}
                >
                  예
                </Button>
              </div>
            </div>
          </div>
        )}

        {showSuccessDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <div className="text-center mb-4">
                <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mt-2">발송이 완료되었습니다</h3>
              </div>
              <p className="text-gray-600 text-center mb-6">
                {formData.recipientName}님에게 카카오 알림톡으로 서명 요청이 발송되었습니다.
              </p>
              <div className="flex justify-center">
                <Button
                  variant="primary"
                  onClick={handleSuccessConfirm}
                >
                  확인
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {showNoSignatureConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-medium mb-4">확인</h3>
              <p className="text-gray-600 mb-6">서명 필드를 추가하지 않은 이미지가 있습니다. 계속 진행하시겠습니까?</p>
              <div className="flex justify-end space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setShowNoSignatureConfirm(false)}
                >
                  아니오
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setShowNoSignatureConfirm(false);
                    setCurrentStep(prev => prev + 1);
                  }}
                >
                  예
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <Card variant="elevated">
          {errorMessage && (
            <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{errorMessage}</p>
                </div>
              </div>
            </div>
          )}
          <CardHeader>
            <CardTitle>새 서명 요청 생성</CardTitle>
            <CardDescription>
              전자서명을 요청할 문서와 수신인 정보를 입력하세요.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {/* 단계 표시 */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    1
                  </div>
                  <div className="ml-2 text-sm font-medium">기본 정보</div>
                </div>
                <div className={`flex-1 h-1 mx-4 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                <div className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    2
                  </div>
                  <div className="ml-2 text-sm font-medium">문서 업로드</div>
                </div>
                <div className={`flex-1 h-1 mx-4 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                <div className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    3
                  </div>
                  <div className="ml-2 text-sm font-medium">서명 위치 지정</div>
                </div>
                <div className={`flex-1 h-1 mx-4 ${currentStep >= 4 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                <div className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    currentStep >= 4 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    4
                  </div>
                  <div className="ml-2 text-sm font-medium">검토 및 발송</div>
                </div>
              </div>
            </div>
            
            {/* 단계 1: 기본 정보 */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    요청 제목 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    placeholder="예: 계약서 서명 요청"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    요청 메시지
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="수신인에게 전달할 메시지를 입력하세요."
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="recipientName" className="block text-sm font-medium text-gray-700 mb-1">
                      수신인 이름 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="recipientName"
                      name="recipientName"
                      value={formData.recipientName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="recipientPhone" className="block text-sm font-medium text-gray-700 mb-1">
                      수신인 전화번호 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="recipientPhone"
                      name="recipientPhone"
                      value={formData.recipientPhone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                    만료일 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="expiryDate"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    max={new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  />
                  <p className="mt-1 text-xs text-gray-500">서명 요청은 만료일까지 유효합니다.</p>
                </div>
              </div>
            )}
            
            {/* 단계 2: 문서 업로드 */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    multiple
                    className="hidden"
                  />
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">문서 업로드</h3>
                  <p className="mt-1 text-sm text-gray-500">PDF, Word, 이미지 파일을 드래그하거나 클릭하여 업로드하세요.</p>
                  <div className="mt-6">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleFileUploadClick}
                    >
                      파일 선택
                    </Button>
                  </div>
                </div>
                {uploadedFiles.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900">업로드된 파일:</h4>
                    <ul className="list-disc list-inside text-sm text-gray-700">
                      {uploadedFiles.map((file, index) => (
                        <li key={index} className="flex justify-between">
                          {file.name}
                          <Button variant="ghost" size="sm" onClick={() => handleFileDelete(index)}>삭제</Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 100-16 8 8 0 000 16zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        업로드된 파일은 서명 요청에 포함됩니다.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* 단계 3: 서명 위치 지정 */}
            {currentStep === 3 && (
              <div className="space-y-6">
                {documentPreviews.length > 0 && renderDocumentControls()}
                <div 
                  id="document-container"
                  className="bg-gray-100 border border-gray-300 rounded-md p-4 h-[400px] flex items-center justify-center relative" 
                  onClick={handleDocumentClick}
                  style={{ 
                    backgroundImage: documentPreviews[currentDocumentIndex] ? `url(${documentPreviews[currentDocumentIndex]})` : 'none',
                    backgroundSize: 'contain',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}
                >
                  {renderSignatureFields()}
                  {!documentPreviews[currentDocumentIndex] && (
                    <div className="text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">문서 미리보기</h3>
                      <p className="mt-1 text-sm text-gray-500">문서를 업로드하면 여기에 표시됩니다.</p>
                    </div>
                  )}
                </div>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700 mb-1">
                        문서에서 서명이 필요한 위치를 클릭하여 서명 필드를 추가하세요.
                      </p>
                      <ul className="text-sm text-yellow-700 list-disc pl-5">
                        <li>서명 필드를 클릭하면 삭제 여부를 확인합니다.</li>
                        <li>오른쪽 하단의 빨간색 모서리(<span className="inline-block w-3 h-3 bg-red-400 align-text-bottom"></span>)를 드래그하여 크기를 조정할 수 있습니다.</li>
                        <li>서명 필드를 드래그하여 원하는 위치로 이동할 수 있습니다.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* 단계 4: 검토 및 발송 (간단한 UI만 구현) */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">요청 정보</h3>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">요청 제목</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formData.title || '(제목 없음)'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">만료일</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formData.expiryDate || '(설정되지 않음)'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">수신인</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {formData.recipientName || '(이름 없음)'} ({formData.recipientPhone || '전화번호 없음'})
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">문서 수</dt>
                      <dd className="mt-1 text-sm text-gray-900">{uploadedFiles.length}개</dd>
                    </div>
                    <div className="md:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">요청 메시지</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formData.message || '(메시지 없음)'}</dd>
                    </div>
                  </dl>
                </div>
                
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">
                        모든 정보를 확인한 후 발송 버튼을 클릭하면 서명 요청이 전송됩니다.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between">
            {currentStep > 1 ? (
              <Button 
                onClick={handlePrevStep}
                variant="outline"
              >
                이전
              </Button>
            ) : (
              <Button 
                href="/sender/dashboard" 
                variant="outline"
              >
                취소
              </Button>
            )}
            
            {currentStep < 4 ? (
              <Button 
                onClick={handleNextStep}
                variant="primary"
              >
                다음
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                loading={isSubmitting}
                disabled={isSubmitting}
                variant="success"
              >
                서명 요청 발송
              </Button>
            )}
          </CardFooter>
        </Card>
      </Container>
    </Layout>
  );
} 