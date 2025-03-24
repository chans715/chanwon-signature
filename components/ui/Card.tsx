'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'bordered' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  hoverable?: boolean;
}

export default function Card({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  onClick,
  hoverable = false,
}: CardProps) {
  // 기본 스타일
  const baseStyle = 'rounded-lg overflow-hidden';
  
  // 변형별 스타일
  const variantStyles = {
    default: 'bg-white',
    bordered: 'bg-white border border-gray-200',
    elevated: 'bg-white shadow-md'
  };
  
  // 패딩 스타일
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-7'
  };
  
  // 호버 스타일
  const hoverStyle = hoverable ? 'transition-transform duration-200 hover:scale-[1.02] hover:shadow-lg' : '';
  
  // 클릭 가능 스타일
  const clickableStyle = onClick ? 'cursor-pointer' : '';
  
  // 최종 스타일
  const cardStyle = `${baseStyle} ${variantStyles[variant]} ${paddingStyles[padding]} ${hoverStyle} ${clickableStyle} ${className}`;
  
  return (
    <div className={cardStyle} onClick={onClick}>
      {children}
    </div>
  );
}

// 카드 헤더 컴포넌트
interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
}

// 카드 타이틀 컴포넌트
interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function CardTitle({ children, className = '' }: CardTitleProps) {
  return (
    <h3 className={`text-xl font-semibold text-gray-800 ${className}`}>
      {children}
    </h3>
  );
}

// 카드 설명 컴포넌트
interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function CardDescription({ children, className = '' }: CardDescriptionProps) {
  return (
    <p className={`text-sm text-gray-500 mt-1 ${className}`}>
      {children}
    </p>
  );
}

// 카드 콘텐츠 컴포넌트
interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

// 카드 푸터 컴포넌트
interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`mt-4 pt-4 border-t border-gray-100 ${className}`}>
      {children}
    </div>
  );
} 