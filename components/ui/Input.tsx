'use client';

import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  containerClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      fullWidth = false,
      icon,
      iconPosition = 'left',
      className = '',
      containerClassName = '',
      ...props
    },
    ref
  ) => {
    // 기본 입력 필드 스타일
    const baseInputStyle = 'block px-4 py-2 bg-white border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors';
    
    // 에러 상태 스타일
    const errorStyle = error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300';
    
    // 아이콘 있을 때 패딩 조정
    const iconPaddingStyle = icon
      ? iconPosition === 'left'
        ? 'pl-10'
        : 'pr-10'
      : '';
    
    // 너비 스타일
    const widthStyle = fullWidth ? 'w-full' : '';
    
    // 최종 입력 필드 스타일
    const inputStyle = `${baseInputStyle} ${errorStyle} ${iconPaddingStyle} ${widthStyle} ${className}`;
    
    // 컨테이너 스타일
    const containerStyle = `${fullWidth ? 'w-full' : ''} ${containerClassName}`;
    
    return (
      <div className={containerStyle}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        
        <div className="relative">
          {icon && iconPosition === 'left' && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
              {icon}
            </div>
          )}
          
          <input
            ref={ref}
            className={inputStyle}
            {...props}
          />
          
          {icon && iconPosition === 'right' && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
              {icon}
            </div>
          )}
        </div>
        
        {helperText && !error && (
          <p className="mt-1 text-xs text-gray-500">{helperText}</p>
        )}
        
        {error && (
          <p className="mt-1 text-xs text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input; 