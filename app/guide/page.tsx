import Link from 'next/link';

export default function Guide() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">전자서명 안내</h1>
        
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">전자서명이란?</h2>
            <p className="text-gray-600">
              전자서명은 종이 문서의 서명과 동일한 법적 효력을 가지는 디지털 서명입니다. 
              전자문서에 서명자의 신원을 확인하고 문서의 위변조를 방지하는 역할을 합니다.
            </p>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-2">전자서명의 법적 효력</h2>
            <p className="text-gray-600">
              전자서명법에 따라 전자서명은 서면 서명과 동일한 법적 효력을 가집니다. 
              본 서비스를 통한 전자서명은 법적으로 유효한 서명으로 인정됩니다.
            </p>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-2">서명 절차</h2>
            <ol className="list-decimal pl-5 text-gray-600 space-y-1">
              <li>터치패드에 서명을 입력합니다.</li>
              <li>신분증 사진을 업로드합니다.</li>
              <li>입력한 정보를 확인 후 제출합니다.</li>
            </ol>
          </div>
          
          <div className="flex justify-between mt-8">
            <Link href="/auth" className="btn-secondary">
              이전
            </Link>
            <Link href="/signature" className="btn-primary">
              서명하기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 