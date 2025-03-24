'use client';

import React from 'react';
import Link from 'next/link';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  href?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  href,
  disabled = false,
  type = 'button',
  onClick,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  loading = false,
}: ButtonProps) {
  // 기본 스타일
  const baseStyle = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  // 크기별 스타일
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  // 변형별 스타일
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-300',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500 disabled:bg-gray-100 disabled:text-gray-400',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500 disabled:text-gray-300',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500 disabled:text-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 disabled:bg-green-300'
  };
  
  // 너비 스타일
  const widthStyle = fullWidth ? 'w-full' : '';
  
  // 최종 스타일
  const buttonStyle = `${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} ${className}`;
  
  // 로딩 스피너
  const loadingSpinner = (
    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
  
  // 아이콘 렌더링
  const renderIcon = () => {
    if (loading) return loadingSpinner;
    if (!icon) return null;
    return icon;
  };
  
  // 내용 렌더링
  const content = (
    <>
      {iconPosition === 'left' && renderIcon()}
      {loading && iconPosition === 'left' ? <span className="ml-2">{children}</span> : children}
      {iconPosition === 'right' && <span className="ml-2">{renderIcon()}</span>}
    </>
  );
  
  // 링크인 경우
  if (href && !disabled) {
    return (
      <Link href={href} className={buttonStyle}>
        {content}
      </Link>
    );
  }
  
  // 버튼인 경우
  return (
    <button
      type={type}
      className={buttonStyle}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {content}
    </button>
  );
} 