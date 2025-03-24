'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

// 진행 단계 정의
const steps = [
  { id: 'auth', name: '본인인증', href: '/auth', icon: UserIcon },
  { id: 'guide', name: '안내', href: '/guide', icon: InfoIcon },
  { id: 'signature', name: '서명', href: '/signature', icon: PenIcon },
  { id: 'document-sign', name: '문서서명', href: '/document-sign', icon: DocumentIcon },
  { id: 'id-card', name: '신분증', href: '/id-card', icon: CardIcon },
  { id: 'complete', name: '완료', href: '/complete', icon: CheckIcon },
];

export default function ProgressIndicator() {
  const pathname = usePathname();
  
  // pathname이 null이면 표시하지 않음
  if (!pathname) return null;
  
  // 현재 단계 찾기
  const currentStepIndex = steps.findIndex((step) => 
    pathname === step.href || pathname.startsWith(`${step.href}/`)
  );
  
  // 메인 페이지에서는 표시하지 않음
  if (pathname === '/') return null;
  
  return (
    <nav aria-label="Progress" className="px-4 py-2 sm:px-6 lg:px-8">
      <ol className="flex items-center justify-center space-x-2 sm:space-x-4">
        {steps.map((step, stepIdx) => {
          const isCurrentStep = stepIdx === currentStepIndex;
          const isCompleted = stepIdx < currentStepIndex;
          
          return (
            <li key={step.id} className="relative">
              {stepIdx !== 0 && (
                <div
                  className={`absolute top-4 left-0 -ml-px mt-0.5 h-0.5 w-5 sm:w-10 ${
                    isCompleted ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                  style={{ right: '100%' }}
                  aria-hidden="true"
                />
              )}
              
              <div className="group relative flex items-center">
                <span className="flex h-9 items-center">
                  <span
                    className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${
                      isCompleted
                        ? 'bg-blue-600 group-hover:bg-blue-800'
                        : isCurrentStep
                        ? 'bg-blue-600'
                        : 'bg-gray-200'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckIcon className="h-5 w-5 text-white" aria-hidden="true" />
                    ) : (
                      <span
                        className={`h-5 w-5 ${
                          isCurrentStep ? 'text-white' : 'text-gray-500'
                        }`}
                      >
                        <step.icon />
                      </span>
                    )}
                  </span>
                </span>
                <span className="ml-2 text-xs sm:text-sm font-medium">
                  {isCompleted ? (
                    <Link
                      href={step.href}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      {step.name}
                    </Link>
                  ) : (
                    <span
                      className={`${
                        isCurrentStep ? 'text-blue-600' : 'text-gray-500'
                      }`}
                    >
                      {step.name}
                    </span>
                  )}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// 아이콘 컴포넌트
function UserIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function PenIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
      />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
      />
    </svg>
  );
}

function CheckIcon({ className = '' }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

// 문서 아이콘 추가
function DocumentIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
} 