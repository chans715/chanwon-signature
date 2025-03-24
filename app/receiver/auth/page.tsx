import React from 'react';
import Container from '@/components/ui/Container';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

const ReceiverAuth: React.FC = () => {
  return (
    <Container maxWidth="sm">
      <Card>
        <CardHeader>
          <CardTitle>본인 인증</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-4">서명을 진행하기 위해 본인 인증을 완료해주세요.</p>
          <Button variant="primary" size="lg">본인 인증 시작</Button>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ReceiverAuth; 