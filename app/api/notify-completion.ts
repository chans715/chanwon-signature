import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { signatureId, recipientEmail } = req.body;

    try {
      // 실제 알림 전송 로직 구현 필요 (예: 이메일, SMS 등)
      console.log(`Sending notification for signature ID: ${signatureId} to ${recipientEmail}`);

      // 예시: 이메일 전송 로직
      // await sendEmailNotification(recipientEmail, signatureId);

      res.status(200).json({ message: 'Notification sent successfully' });
    } catch (error) {
      console.error('Error sending notification:', error);
      res.status(500).json({ error: 'Failed to send notification' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// 실제 이메일 전송 함수 구현 필요
// async function sendEmailNotification(email: string, signatureId: string) {
//   // 이메일 전송 로직
// } 