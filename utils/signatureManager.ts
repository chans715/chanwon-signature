import { encrypt, decrypt } from './encryption';

interface SignatureData {
  id: string;
  signatureImage: string;
  createdAt: string;
  userId: string;
  documentId?: string;
}

/**
 * 서명 데이터를 암호화하여 저장합니다.
 * @param signatureData 서명 데이터 객체
 * @returns 암호화된 서명 데이터 문자열
 */
export function encryptSignatureData(signatureData: SignatureData): string {
  return encrypt(JSON.stringify(signatureData));
}

/**
 * 암호화된 서명 데이터를 복호화합니다.
 * @param encryptedData 암호화된 서명 데이터 문자열
 * @returns 복호화된 서명 데이터 객체
 */
export function decryptSignatureData(encryptedData: string): SignatureData {
  const decryptedData = decrypt(encryptedData);
  return JSON.parse(decryptedData);
}

/**
 * 서명 이미지 데이터를 검증합니다.
 * @param signatureImage 서명 이미지 데이터 (base64)
 * @returns 검증 결과 (유효성 여부)
 */
export function validateSignatureImage(signatureImage: string): boolean {
  // 기본적인 유효성 검사
  if (!signatureImage) return false;
  
  // base64 데이터 형식 검증
  if (!signatureImage.startsWith('data:image/')) return false;
  
  // 이미지 크기 검증 (대략적인 크기 제한: 1MB)
  const base64Data = signatureImage.split(',')[1] || '';
  const sizeInBytes = (base64Data.length * 3) / 4;
  if (sizeInBytes > 1024 * 1024) return false;
  
  return true;
}

/**
 * 서명 데이터의 무결성을 검증합니다.
 * @param signatureData 서명 데이터 객체
 * @returns 검증 결과 (유효성 여부)
 */
export function verifySignatureIntegrity(signatureData: SignatureData): boolean {
  // 필수 필드 검증
  if (!signatureData.id || !signatureData.signatureImage || !signatureData.createdAt || !signatureData.userId) {
    return false;
  }
  
  // 서명 이미지 검증
  if (!validateSignatureImage(signatureData.signatureImage)) {
    return false;
  }
  
  // 생성 시간 검증 (유효한 날짜인지)
  const createdDate = new Date(signatureData.createdAt);
  if (isNaN(createdDate.getTime())) {
    return false;
  }
  
  return true;
} 