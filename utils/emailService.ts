import nodemailer from 'nodemailer';

// 이메일 전송을 위한 트랜스포터 설정
// 실제 환경에서는 환경 변수에서 설정 가져오기
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-email-password'
  }
});

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content?: Buffer | string;
    path?: string;
    contentType?: string;
  }>;
}

/**
 * 이메일을 발송합니다.
 * @param options 이메일 옵션
 * @returns 발송 결과
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || '전자서명 서비스 <noreply@esign.com>',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments
    };
    
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('이메일 발송 오류:', error);
    return false;
  }
}

/**
 * 서명 완료 알림 이메일을 발송합니다.
 * @param to 수신자 이메일
 * @param name 수신자 이름
 * @param signatureId 서명 ID
 * @param documentName 문서 이름
 * @returns 발송 결과
 */
export async function sendSignatureCompletionEmail(
  to: string,
  name: string,
  signatureId: string,
  documentName: string
): Promise<boolean> {
  const subject = `[전자서명 서비스] ${documentName} 서명이 완료되었습니다`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">전자서명이 완료되었습니다</h2>
      <p>안녕하세요, ${name}님.</p>
      <p><strong>${documentName}</strong> 문서에 대한 전자서명이 성공적으로 완료되었습니다.</p>
      <p>서명 ID: ${signatureId}</p>
      <p>서명 일시: ${new Date().toLocaleString('ko-KR')}</p>
      <div style="margin: 20px 0; padding: 15px; background-color: #f3f4f6; border-radius: 5px;">
        <p style="margin: 0;">서명된 문서는 첨부파일을 확인하시거나 아래 링크를 통해 확인하실 수 있습니다.</p>
      </div>
      <a href="https://yourdomain.com/documents/${signatureId}" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px;">문서 확인하기</a>
      <p style="margin-top: 30px; font-size: 12px; color: #6b7280;">
        본 이메일은 발신 전용이며, 회신하실 경우 답변을 받지 못할 수 있습니다.<br>
        문의사항이 있으시면 고객센터(1234-5678)로 연락해주세요.
      </p>
    </div>
  `;
  
  return sendEmail({
    to,
    subject,
    html
  });
} 