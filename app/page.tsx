'use client';

import Link from 'next/link';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import Image from 'next/image';
import { useState } from 'react';

export default function Home() {
  const [activeFeature, setActiveFeature] = useState(0);
  
  const features = [
    {
      title: '간편한 전자서명',
      description: '언제 어디서나 모바일로 간편하게 서명할 수 있습니다.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      )
    },
    {
      title: '법적 효력 보장',
      description: '전자서명법에 따라 법적 효력이 보장됩니다.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      title: '신원 인증',
      description: 'PASS 인증을 통한 안전한 신원 확인이 가능합니다.',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* 히어로 섹션 */}
      <section className="relative py-20 overflow-hidden">
        <Container>
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                비대면 <span className="text-blue-600">전자서명</span> 서비스
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl">
                언제 어디서나 안전하고 편리하게 전자서명을 진행할 수 있습니다. 
                법적 효력이 보장되는 전자서명으로 업무 효율성을 높여보세요.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button href="/auth" size="lg">
                  서명 요청하기
                </Button>
                <Button href="/about" variant="outline" size="lg">
                  서비스 소개
                </Button>
              </div>
            </div>
            <div className="flex-1 relative h-[400px] w-full">
              <div className="absolute top-0 right-0 w-full h-full bg-blue-100 rounded-2xl transform rotate-3"></div>
              <div className="absolute top-0 right-0 w-full h-full bg-white shadow-xl rounded-2xl -rotate-3 overflow-hidden">
                <div className="p-6 h-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 특징 섹션 */}
      <section className="py-20 bg-white">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              서비스 특징
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              비대면 전자서명 서비스의 주요 특징을 확인해보세요.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                variant="elevated" 
                hoverable 
                className="text-center"
                onClick={() => setActiveFeature(index)}
              >
                <CardContent>
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA 섹션 */}
      <section className="py-20 bg-blue-600 text-white">
        <Container>
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              지금 바로 시작하세요
            </h2>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-8">
              비대면 전자서명 서비스로 업무 효율성을 높이고 시간과 비용을 절약하세요.
            </p>
            <Button 
              href="/auth" 
              variant="secondary" 
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              서명 요청하기
            </Button>
          </div>
        </Container>
      </section>
    </main>
  );
} 