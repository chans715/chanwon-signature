"use client";

import React from 'react';
import Container from '@/components/ui/Container';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

const SenderMain: React.FC = () => {
  const router = useRouter();

  const handleRequestClick = () => {
    router.push('/sender/dashboard');
  };

  const handleAuthClick = () => {
    router.push('/receiver/auth');
  };

  const handleAdminClick = () => {
    router.push('/admin/dashboard');
  };

  return (
    <Container maxWidth="lg">
      <Card>
        <CardHeader>
          <CardTitle>비대면 전자서명 서비스</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-4">언제 어디서나 안전하고 편리하게 전자서명을 진행할 수 있습니다. 법적 효력이 보장되는 전자서명으로 업무 효율성을 높여보세요.</p>
          <Button variant="primary" size="lg" onClick={handleRequestClick}>서명 요청하기</Button>
          <Button variant="secondary" size="lg" onClick={handleAuthClick} className="ml-2">전자서명하기</Button>
          <Button variant="secondary" size="lg" onClick={handleAdminClick} className="ml-2">관리자</Button>
          <Button variant="secondary" size="lg" onClick={handleAdminClick} className="ml-2">테스트 접속</Button>
        </CardContent>
      </Card>
    </Container>
  );
};

export default SenderMain; 