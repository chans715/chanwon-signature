'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useError } from '@/components/ErrorHandler';
import Container from '@/components/ui/Container';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

// 샘플 통계 데이터
const sampleStatistics = {
  // 서명 요청 통계
  signatureRequests: {
    total: 1250,
    pending: 320,
    viewed: 180,
    completed: 650,
    expired: 100,
    // 최근 7일간의 일별 요청 수
    dailyRequests: [
      { date: '2023-11-01', count: 42 },
      { date: '2023-11-02', count: 38 },
      { date: '2023-11-03', count: 45 },
      { date: '2023-11-04', count: 30 },
      { date: '2023-11-05', count: 25 },
      { date: '2023-11-06', count: 40 },
      { date: '2023-11-07', count: 48 }
    ],
    // 최근 6개월간의 월별 요청 수
    monthlyRequests: [
      { month: '2023-06', count: 210 },
      { month: '2023-07', count: 180 },
      { month: '2023-08', count: 195 },
      { month: '2023-09', count: 230 },
      { month: '2023-10', count: 250 },
      { month: '2023-11', count: 185 }
    ]
  },
  
  // 사용자 통계
  users: {
    total: 450,
    active: 380,
    inactive: 70,
    // 최근 6개월간의 월별 신규 사용자 수
    newUsers: [
      { month: '2023-06', count: 35 },
      { month: '2023-07', count: 42 },
      { month: '2023-08', count: 38 },
      { month: '2023-09', count: 45 },
      { month: '2023-10', count: 50 },
      { month: '2023-11', count: 40 }
    ],
    // 사용자 유형별 분포
    userTypes: [
      { type: '개인', count: 180 },
      { type: '기업', count: 220 },
      { type: '공공기관', count: 50 }
    ]
  },
  
  // 시스템 사용량 통계
  system: {
    // CPU 사용량 (%)
    cpuUsage: [
      { time: '09:00', usage: 45 },
      { time: '10:00', usage: 52 },
      { time: '11:00', usage: 60 },
      { time: '12:00', usage: 58 },
      { time: '13:00', usage: 65 },
      { time: '14:00', usage: 70 },
      { time: '15:00', usage: 68 }
    ],
    // 메모리 사용량 (%)
    memoryUsage: [
      { time: '09:00', usage: 62 },
      { time: '10:00', usage: 65 },
      { time: '11:00', usage: 70 },
      { time: '12:00', usage: 72 },
      { time: '13:00', usage: 75 },
      { time: '14:00', usage: 78 },
      { time: '15:00', usage: 76 }
    ],
    // 디스크 사용량 (%)
    diskUsage: 68,
    // 평균 응답 시간 (ms)
    responseTime: [
      { time: '09:00', value: 120 },
      { time: '10:00', value: 135 },
      { time: '11:00', value: 150 },
      { time: '12:00', value: 145 },
      { time: '13:00', value: 160 },
      { time: '14:00', value: 170 },
      { time: '15:00', value: 165 }
    ]
  }
};

export default function AdminStatistics() {
  const router = useRouter();
  const { addError } = useError();
  const [isLoading, setIsLoading] = useState(true);
  const [statistics, setStatistics] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('week');
  
  useEffect(() => {
    // 실제로는 API에서 통계 데이터를 가져옴
    const fetchStatistics = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1500)); // 로딩 시뮬레이션
        setStatistics(sampleStatistics);
        setIsLoading(false);
      } catch (error) {
        addError('error', '통계 데이터를 불러오는 중 오류가 발생했습니다.', true, 5000);
        setIsLoading(false);
      }
    };
    
    fetchStatistics();
  }, [addError]);
  
  // 차트 렌더링 함수 (실제로는 Chart.js 등의 라이브러리 사용)
  const renderBarChart = (data: any[], xKey: string, yKey: string, color: string) => {
    // 실제 구현에서는 Chart.js 등의 라이브러리를 사용하여 차트 렌더링
    // 여기서는 간단한 시각적 표현만 구현
    const maxValue = Math.max(...data.map(item => item[yKey]));
    
    return (
      <div className="h-60 flex items-end space-x-2">
        {data.map((item, index) => {
          const height = (item[yKey] / maxValue) * 100;
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div 
                className={`w-full ${color} rounded-t-md`} 
                style={{ height: `${height}%` }}
              ></div>
              <div className="text-xs text-gray-500 mt-1 truncate w-full text-center">
                {item[xKey].split('-').slice(-1)[0]}
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  
  const renderLineChart = (data: any[], xKey: string, yKey: string, color: string) => {
    // 실제 구현에서는 Chart.js 등의 라이브러리를 사용하여 차트 렌더링
    // 여기서는 간단한 시각적 표현만 구현
    const maxValue = Math.max(...data.map(item => item[yKey]));
    const minValue = Math.min(...data.map(item => item[yKey]));
    const range = maxValue - minValue;
    
    return (
      <div className="h-60 flex flex-col">
        <div className="flex-1 relative">
          <div className="absolute inset-0 flex items-end">
            {data.map((item, index) => {
              const height = ((item[yKey] - minValue) / range) * 100;
              const isLast = index === data.length - 1;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center justify-end h-full">
                  <div className="w-2 h-2 rounded-full bg-white border-2 border-blue-500 z-10"></div>
                  <div 
                    className={`w-full ${color} absolute bottom-0`} 
                    style={{ height: `${height}%` }}
                  ></div>
                  {index < data.length - 1 && (
                    <div 
                      className={`absolute h-px ${color} z-0`}
                      style={{ 
                        width: '100%', 
                        bottom: `${height}%`,
                        left: '50%'
                      }}
                    ></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="h-6 flex">
          {data.map((item, index) => (
            <div key={index} className="flex-1 text-xs text-gray-500 text-center truncate">
              {item[xKey]}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  const renderPieChart = (data: any[], labelKey: string, valueKey: string) => {
    // 실제 구현에서는 Chart.js 등의 라이브러리를 사용하여 차트 렌더링
    // 여기서는 간단한 시각적 표현만 구현
    const total = data.reduce((sum, item) => sum + item[valueKey], 0);
    
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-red-500'
    ];
    
    return (
      <div className="flex flex-col items-center">
        <div className="w-40 h-40 rounded-full border-8 border-gray-100 relative mb-4">
          {data.map((item, index) => {
            const percentage = (item[valueKey] / total) * 100;
            return (
              <div 
                key={index}
                className={`absolute inset-0 ${colors[index % colors.length]}`}
                style={{
                  clipPath: `polygon(50% 50%, 50% 0, ${50 + percentage}% 0, ${50 + percentage}% ${50 + percentage}%)`
                }}
              ></div>
            );
          })}
        </div>
        <div className="w-full space-y-2">
          {data.map((item, index) => {
            const percentage = ((item[valueKey] / total) * 100).toFixed(1);
            return (
              <div key={index} className="flex items-center">
                <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]} mr-2`}></div>
                <div className="text-sm text-gray-700">{item[labelKey]}</div>
                <div className="ml-auto text-sm font-medium">{percentage}%</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  const renderGauge = (value: number, max: number = 100, color: string = 'bg-blue-500') => {
    const percentage = (value / max) * 100;
    
    return (
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-16 overflow-hidden">
          <div className="absolute inset-0 bg-gray-200 rounded-t-full"></div>
          <div 
            className={`absolute bottom-0 ${color} rounded-t-full`}
            style={{ 
              width: '100%', 
              height: `${percentage}%`
            }}
          ></div>
        </div>
        <div className="mt-2 text-2xl font-bold">{value}%</div>
      </div>
    );
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
        <Container maxWidth="xl">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </Container>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <Container maxWidth="xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">시스템 통계</h1>
            <p className="text-gray-600 mt-1">서명 요청, 사용자 활동, 시스템 사용량 등의 통계를 확인할 수 있습니다.</p>
          </div>
          <div className="flex rounded-md shadow-sm">
            <button
              onClick={() => setTimeRange('day')}
              className={`px-4 py-2 text-sm font-medium ${
                timeRange === 'day'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } border border-gray-300 rounded-l-md`}
            >
              일간
            </button>
            <button
              onClick={() => setTimeRange('week')}
              className={`px-4 py-2 text-sm font-medium ${
                timeRange === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } border-t border-b border-gray-300`}
            >
              주간
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-4 py-2 text-sm font-medium ${
                timeRange === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } border-t border-b border-l border-gray-300`}
            >
              월간
            </button>
            <button
              onClick={() => setTimeRange('year')}
              className={`px-4 py-2 text-sm font-medium ${
                timeRange === 'year'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } border border-gray-300 rounded-r-md`}
            >
              연간
            </button>
          </div>
        </div>
        
        {/* 서명 요청 통계 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">서명 요청 통계</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 mr-4">
                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">전체 요청</p>
                    <p className="text-2xl font-bold text-gray-900">{statistics.signatureRequests.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100 mr-4">
                    <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">대기 중</p>
                    <p className="text-2xl font-bold text-gray-900">{statistics.signatureRequests.pending}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 mr-4">
                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">확인됨</p>
                    <p className="text-2xl font-bold text-gray-900">{statistics.signatureRequests.viewed}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 mr-4">
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">완료됨</p>
                    <p className="text-2xl font-bold text-gray-900">{statistics.signatureRequests.completed}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-red-100 mr-4">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">만료됨</p>
                    <p className="text-2xl font-bold text-gray-900">{statistics.signatureRequests.expired}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>일별 서명 요청</CardTitle>
                <CardDescription>
                  최근 7일간의 일별 서명 요청 수
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderBarChart(
                  statistics.signatureRequests.dailyRequests,
                  'date',
                  'count',
                  'bg-blue-500'
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>월별 서명 요청</CardTitle>
                <CardDescription>
                  최근 6개월간의 월별 서명 요청 수
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderBarChart(
                  statistics.signatureRequests.monthlyRequests,
                  'month',
                  'count',
                  'bg-green-500'
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* 사용자 통계 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">사용자 통계</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 mr-4">
                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">전체 사용자</p>
                    <p className="text-2xl font-bold text-gray-900">{statistics.users.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 mr-4">
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">활성 사용자</p>
                    <p className="text-2xl font-bold text-gray-900">{statistics.users.active}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-red-100 mr-4">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">비활성 사용자</p>
                    <p className="text-2xl font-bold text-gray-900">{statistics.users.inactive}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>신규 사용자</CardTitle>
                <CardDescription>
                  최근 6개월간의 월별 신규 사용자 수
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderBarChart(
                  statistics.users.newUsers,
                  'month',
                  'count',
                  'bg-purple-500'
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>사용자 유형</CardTitle>
                <CardDescription>
                  사용자 유형별 분포
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderPieChart(
                  statistics.users.userTypes,
                  'type',
                  'count'
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* 시스템 사용량 통계 */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">시스템 사용량</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>CPU 사용량</CardTitle>
                <CardDescription>
                  최근 7시간 동안의 CPU 사용량 (%)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderLineChart(
                  statistics.system.cpuUsage,
                  'time',
                  'usage',
                  'bg-blue-500'
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>메모리 사용량</CardTitle>
                <CardDescription>
                  최근 7시간 동안의 메모리 사용량 (%)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderLineChart(
                  statistics.system.memoryUsage,
                  'time',
                  'usage',
                  'bg-green-500'
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>디스크 사용량</CardTitle>
                <CardDescription>
                  현재 디스크 사용량 (%)
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center items-center h-60">
                {renderGauge(
                  statistics.system.diskUsage,
                  100,
                  'bg-yellow-500'
                )}
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>평균 응답 시간</CardTitle>
              <CardDescription>
                최근 7시간 동안의 평균 응답 시간 (ms)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderLineChart(
                statistics.system.responseTime,
                'time',
                'value',
                'bg-red-500'
              )}
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  );
} 