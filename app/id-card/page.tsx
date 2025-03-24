'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useError } from '@/components/ErrorHandler';
import Container from '@/components/ui/Container';
import Card, { CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function IdCard() {
  const router = useRouter();
  const { addError } = useError();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 검증 (10MB 제한)
    if (file.size > 10 * 1024 * 1024) {
      setError('파일 크기는 10MB를 초과할 수 없습니다.');
      return;
    }

    // 파일 형식 검증
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      setError('JPG, PNG, GIF 형식의 이미지만 업로드 가능합니다.');
      return;
    }

    setError('');
    
    // 이미지 미리보기 생성
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    
    // 파일 크기 검증 (10MB 제한)
    if (file.size > 10 * 1024 * 1024) {
      setError('파일 크기는 10MB를 초과할 수 없습니다.');
      return;
    }

    // 파일 형식 검증
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      setError('JPG, PNG, GIF 형식의 이미지만 업로드 가능합니다.');
      return;
    }

    setError('');
    
    // 이미지 미리보기 생성
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadedImage) {
      setError('신분증 이미지를 업로드해주세요.');
      addError('warning', '신분증 이미지를 업로드해주세요.', true, 3000);
      return;
    }
    
    setIsUploading(true);
    
    try {
      // 실제로는 여기서 이미지 업로드 API를 호출합니다
      await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5초 지연
      
      // 업로드 정보를 세션 스토리지에 저장
      sessionStorage.setItem('idCardUpload', JSON.stringify({
        uploadDate: new Date().toISOString(),
        isUploaded: true
      }));
      
      // 업로드 성공 후 완료 페이지로 이동
      router.push('/complete');
    } catch (err) {
      setError('업로드 과정에서 오류가 발생했습니다. 다시 시도해주세요.');
      addError('error', '업로드 과정에서 오류가 발생했습니다. 다시 시도해주세요.', true, 5000);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <Container maxWidth="md">
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>신분증 업로드</CardTitle>
            <CardDescription>
              본인 확인을 위해 신분증 사진을 업로드해주세요. 주민등록증, 운전면허증, 여권 중 하나를 선택하여 업로드할 수 있습니다.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md text-sm">
                <div className="flex">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {error}
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
                  uploadedImage 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                }`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {uploadedImage ? (
                  <div className="space-y-4">
                    <div className="relative w-full h-64 mx-auto">
                      <Image 
                        src={uploadedImage} 
                        alt="업로드된 신분증" 
                        fill
                        style={{ objectFit: 'contain' }}
                        className="rounded-md"
                      />
                    </div>
                    <div className="flex items-center justify-center text-sm text-green-600 font-medium">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      이미지가 성공적으로 업로드되었습니다!
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUploadedImage(null)}
                      icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                      }
                    >
                      다른 이미지 업로드
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <svg className="mx-auto h-16 w-16 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">
                        이미지를 끌어다 놓거나 클릭하여 업로드하세요
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, GIF 최대 10MB
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                      }
                    >
                      파일 선택
                    </Button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  accept="image/jpeg,image/png,image/gif"
                  onChange={handleFileChange}
                />
              </div>
              
              <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      신분증 정보는 안전하게 보호되며, 본인 확인 후 즉시 삭제됩니다. 개인정보가 노출되지 않도록 주의해주세요.
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button 
              href="/document-sign" 
              variant="outline"
            >
              이전
            </Button>
            <Button 
              onClick={handleSubmit}
              loading={isUploading}
              disabled={isUploading}
              variant="primary"
            >
              제출하기
            </Button>
          </CardFooter>
        </Card>
      </Container>
    </div>
  );
}