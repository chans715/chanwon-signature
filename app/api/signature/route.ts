import { NextRequest, NextResponse } from 'next/server';
import { encryptSignatureData, validateSignatureImage } from '@/utils/signatureManager';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// 서명 데이터 저장 디렉토리 (실제 환경에서는 보안된 스토리지 사용)
const SIGNATURES_DIR = path.join(process.cwd(), 'data', 'signatures');

// 디렉토리가 없으면 생성
if (!fs.existsSync(SIGNATURES_DIR)) {
  fs.mkdirSync(SIGNATURES_DIR, { recursive: true });
}

/**
 * 서명 데이터 저장 API
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { signatureImage, userId } = data;
    
    // 필수 데이터 검증
    if (!signatureImage || !userId) {
      return NextResponse.json(
        { error: '필수 데이터가 누락되었습니다.' },
        { status: 400 }
      );
    }
    
    // 서명 이미지 유효성 검증
    if (!validateSignatureImage(signatureImage)) {
      return NextResponse.json(
        { error: '유효하지 않은 서명 이미지입니다.' },
        { status: 400 }
      );
    }
    
    // 서명 데이터 생성
    const signatureId = uuidv4();
    const signatureData = {
      id: signatureId,
      signatureImage,
      createdAt: new Date().toISOString(),
      userId,
      documentId: data.documentId || null
    };
    
    // 서명 데이터 암호화
    const encryptedData = encryptSignatureData(signatureData);
    
    // 파일로 저장
    const filePath = path.join(SIGNATURES_DIR, `${signatureId}.sig`);
    fs.writeFileSync(filePath, encryptedData);
    
    return NextResponse.json({
      success: true,
      signatureId,
      message: '서명이 성공적으로 저장되었습니다.'
    });
  } catch (error) {
    console.error('서명 저장 오류:', error);
    return NextResponse.json(
      { error: '서명 저장 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 서명 데이터 조회 API
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }
    
    // 사용자의 서명 목록 조회 (실제 환경에서는 데이터베이스 사용)
    const signatures = [];
    const files = fs.readdirSync(SIGNATURES_DIR);
    
    for (const file of files) {
      if (file.endsWith('.sig')) {
        const filePath = path.join(SIGNATURES_DIR, file);
        const encryptedData = fs.readFileSync(filePath, 'utf8');
        
        // 실제 환경에서는 여기서 복호화하여 userId 확인 후 목록에 추가
        // const signatureData = decryptSignatureData(encryptedData);
        // if (signatureData.userId === userId) {
        //   signatures.push({
        //     id: signatureData.id,
        //     createdAt: signatureData.createdAt
        //   });
        // }
        
        // 개발 환경에서는 모든 서명 반환
        signatures.push({
          id: file.replace('.sig', ''),
          createdAt: new Date().toISOString()
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      signatures
    });
  } catch (error) {
    console.error('서명 조회 오류:', error);
    return NextResponse.json(
      { error: '서명 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 