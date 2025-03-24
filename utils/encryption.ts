import crypto from 'crypto';

// 환경 변수에서 암호화 키를 가져오거나 기본값 사용 (실제 환경에서는 .env 파일에 저장)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-secure-encryption-key-min-32-chars';
const IV_LENGTH = 16; // AES 블록 크기

/**
 * 데이터를 암호화합니다.
 * @param text 암호화할 텍스트
 * @returns 암호화된 텍스트 (hex 형식)
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // IV를 암호화된 텍스트 앞에 추가 (복호화 시 필요)
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * 암호화된 데이터를 복호화합니다.
 * @param text 복호화할 텍스트 (hex 형식)
 * @returns 복호화된 텍스트
 */
export function decrypt(text: string): string {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift() || '', 'hex');
  const encryptedText = textParts.join(':');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * 개인정보를 안전하게 마스킹합니다.
 * @param text 마스킹할 텍스트
 * @param visibleStart 시작부분에 보여줄 문자 수
 * @param visibleEnd 끝부분에 보여줄 문자 수
 * @returns 마스킹된 텍스트
 */
export function maskPersonalInfo(text: string, visibleStart: number = 0, visibleEnd: number = 0): string {
  if (!text) return '';
  
  const start = text.substring(0, visibleStart);
  const end = text.substring(text.length - visibleEnd);
  const masked = '*'.repeat(Math.max(text.length - visibleStart - visibleEnd, 0));
  
  return start + masked + end;
} 