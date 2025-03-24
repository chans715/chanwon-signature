import { NextRequest, NextResponse } from 'next/server';
import { encrypt } from '@/utils/encryption';
import { v4 as uuidv4 } from 'uuid';

/**
 * 본인인증 요청 API
 * 실제 환경에서는 PASS 또는 다른 인증 서비스와 연동
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { name, phone, birthdate } = data;
    
    // 필수 데이터 검증
    if (!name || !phone || !birthdate) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }
    
    // 데이터 형식 검증
    if (phone.length !== 11 || !/^\d+$/.test(phone)) {
      return NextResponse.json(
        { error: '올바른 휴대폰 번호 형식이 아닙니다.' },
        { status: 400 }
      );
    }
    
    if (birthdate.length !== 6 || !/^\d+$/.test(birthdate)) {
      return NextResponse.json(
        { error: '올바른 생년월일 형식이 아닙니다.' },
        { status: 400 }
      );
    }
    
    // 실제 환경에서는 여기서 PASS API 호출
    // 개발 환경에서는 인증 성공으로 가정
    
    // 인증 정보 생성
    const userId = uuidv4();
    const authData = {
      userId,
      name,
      phone,
      birthdate,
      authDate: new Date().toISOString(),
      isAuthenticated: true
    };
    
    // 인증 정보 암호화 (실제 환경에서는 토큰으로 관리)
    const encryptedAuthData = encrypt(JSON.stringify(authData));
    
    return NextResponse.json({
      success: true,
      userId,
      authToken: encryptedAuthData,
      message: '본인인증이 성공적으로 완료되었습니다.'
    });
  } catch (error) {
    console.error('본인인증 오류:', error);
    return NextResponse.json(
      { error: '본인인증 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 인증 상태 확인 API
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const authToken = searchParams.get('authToken');
    
    if (!userId || !authToken) {
      return NextResponse.json(
        { error: '인증 정보가 필요합니다.' },
        { status: 400 }
      );
    }
    
    // 실제 환경에서는 여기서 토큰 검증
    // 개발 환경에서는 항상 유효한 것으로 가정
    
    return NextResponse.json({
      success: true,
      isAuthenticated: true,
      message: '유효한 인증 정보입니다.'
    });
  } catch (error) {
    console.error('인증 상태 확인 오류:', error);
    return NextResponse.json(
      { error: '인증 상태 확인 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 