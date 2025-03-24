'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// 오류 타입 정의
export type ErrorType = 'info' | 'warning' | 'error' | 'success';

// 오류 메시지 인터페이스
export interface ErrorMessage {
  id: string;
  type: ErrorType;
  message: string;
  autoClose?: boolean;
  duration?: number;
}

// 오류 컨텍스트 인터페이스
interface ErrorContextType {
  errors: ErrorMessage[];
  addError: (type: ErrorType, message: string, autoClose?: boolean, duration?: number) => void;
  removeError: (id: string) => void;
  clearErrors: () => void;
}

// 기본 컨텍스트 값
const defaultContext: ErrorContextType = {
  errors: [],
  addError: () => {},
  removeError: () => {},
  clearErrors: () => {},
};

// 오류 컨텍스트 생성
const ErrorContext = createContext<ErrorContextType>(defaultContext);

// 오류 컨텍스트 훅
export const useError = () => useContext(ErrorContext);

// 오류 제공자 컴포넌트
export function ErrorProvider({ children }: { children: ReactNode }) {
  const [errors, setErrors] = useState<ErrorMessage[]>([]);

  // 오류 추가
  const addError = (
    type: ErrorType,
    message: string,
    autoClose: boolean = true,
    duration: number = 5000
  ) => {
    const id = Date.now().toString();
    const newError = { id, type, message, autoClose, duration };
    
    setErrors((prevErrors) => [...prevErrors, newError]);
    
    if (autoClose) {
      setTimeout(() => {
        removeError(id);
      }, duration);
    }
  };

  // 오류 제거
  const removeError = (id: string) => {
    setErrors((prevErrors) => prevErrors.filter((error) => error.id !== id));
  };

  // 모든 오류 제거
  const clearErrors = () => {
    setErrors([]);
  };

  return (
    <ErrorContext.Provider value={{ errors, addError, removeError, clearErrors }}>
      {children}
      <ErrorDisplay />
    </ErrorContext.Provider>
  );
}

// 오류 표시 컴포넌트
function ErrorDisplay() {
  const { errors, removeError } = useError();

  if (errors.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {errors.map((error) => (
        <div
          key={error.id}
          className={`p-4 rounded-md shadow-lg flex items-start justify-between ${getBackgroundColor(
            error.type
          )}`}
          role="alert"
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">{getIcon(error.type)}</div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${getTextColor(error.type)}`}>
                {error.message}
              </p>
            </div>
          </div>
          <button
            type="button"
            className={`ml-4 inline-flex ${getTextColor(error.type)} hover:opacity-75`}
            onClick={() => removeError(error.id)}
          >
            <span className="sr-only">닫기</span>
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

// 배경색 가져오기
function getBackgroundColor(type: ErrorType): string {
  switch (type) {
    case 'info':
      return 'bg-blue-50';
    case 'warning':
      return 'bg-yellow-50';
    case 'error':
      return 'bg-red-50';
    case 'success':
      return 'bg-green-50';
    default:
      return 'bg-gray-50';
  }
}

// 텍스트 색상 가져오기
function getTextColor(type: ErrorType): string {
  switch (type) {
    case 'info':
      return 'text-blue-800';
    case 'warning':
      return 'text-yellow-800';
    case 'error':
      return 'text-red-800';
    case 'success':
      return 'text-green-800';
    default:
      return 'text-gray-800';
  }
}

// 아이콘 가져오기
function getIcon(type: ErrorType) {
  switch (type) {
    case 'info':
      return (
        <svg
          className="h-5 w-5 text-blue-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      );
    case 'warning':
      return (
        <svg
          className="h-5 w-5 text-yellow-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      );
    case 'error':
      return (
        <svg
          className="h-5 w-5 text-red-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      );
    case 'success':
      return (
        <svg
          className="h-5 w-5 text-green-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      );
    default:
      return null;
  }
} 