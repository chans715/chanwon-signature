require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const Signature = require('./models/Signature');
const Document = require('./models/Document');

// Express 앱 초기화
const app = express();
const PORT = process.env.PORT || 3001;

// 미들웨어 설정
app.use(cors()); // CORS 허용
app.use(bodyParser.json({ limit: '50mb' })); // 요청 본문 파싱 (큰 이미지 처리를 위해 50MB로 제한 설정)
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// MongoDB 연결
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB 연결 성공!');
  })
  .catch(err => {
    console.error('MongoDB 연결 실패:', err);
    process.exit(1);
  });

// 기본 경로
app.get('/', (req, res) => {
  res.send('서명 API 서버가 실행 중입니다.');
});

// 서명 이미지 저장 API
app.post('/api/signatures', async (req, res) => {
  try {
    const { signatureId, signatureImage, documentId, positions } = req.body;

    if (!signatureId || !signatureImage || !documentId) {
      return res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
    }

    // 서명 데이터 생성
    const signature = new Signature({
      signatureId,
      signatureImage,
      documentId,
      positions: positions || []
    });

    // 저장
    await signature.save();

    // 해당 문서의 서명 상태 업데이트
    if (positions && positions.length > 0) {
      await Document.findOneAndUpdate(
        { documentId },
        { 
          $set: { 
            'signaturePositions.$[elem].signed': true,
            'signaturePositions.$[elem].signatureId': signatureId,
            isSigned: true,
            updatedAt: new Date()
          }
        },
        { 
          arrayFilters: [{ 'elem.id': { $in: positions.map(pos => pos.id) } }],
          new: true
        }
      );
    }

    res.status(201).json({ 
      message: '서명이 성공적으로 저장되었습니다.',
      signatureId
    });
  } catch (error) {
    console.error('서명 저장 오류:', error);
    res.status(500).json({ error: '서명 저장 중 오류가 발생했습니다.', details: error.message });
  }
});

// 서명 이미지 조회 API
app.get('/api/signatures/:signatureId', async (req, res) => {
  try {
    const { signatureId } = req.params;
    const signature = await Signature.findOne({ signatureId });

    if (!signature) {
      return res.status(404).json({ error: '서명을 찾을 수 없습니다.' });
    }

    res.json({ signature });
  } catch (error) {
    console.error('서명 조회 오류:', error);
    res.status(500).json({ error: '서명 조회 중 오류가 발생했습니다.' });
  }
});

// 문서 저장 API
app.post('/api/documents', async (req, res) => {
  try {
    const { documentId, imageUrl, pdfUrl, type, signaturePositions } = req.body;

    if (!documentId || !imageUrl) {
      return res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
    }

    // 이미 존재하는 문서인지 확인
    const existingDocument = await Document.findOne({ documentId });
    if (existingDocument) {
      return res.status(409).json({ error: '이미 존재하는 문서 ID입니다.' });
    }

    // 문서 데이터 생성
    const document = new Document({
      documentId,
      imageUrl,
      pdfUrl,
      type: type || 'image',
      signaturePositions: signaturePositions || []
    });

    // 저장
    await document.save();

    res.status(201).json({ 
      message: '문서가 성공적으로 저장되었습니다.',
      documentId
    });
  } catch (error) {
    console.error('문서 저장 오류:', error);
    res.status(500).json({ error: '문서 저장 중 오류가 발생했습니다.' });
  }
});

// 문서 조회 API
app.get('/api/documents/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;
    const document = await Document.findOne({ documentId: Number(documentId) });

    if (!document) {
      return res.status(404).json({ error: '문서를 찾을 수 없습니다.' });
    }

    res.json({ document });
  } catch (error) {
    console.error('문서 조회 오류:', error);
    res.status(500).json({ error: '문서 조회 중 오류가 발생했습니다.' });
  }
});

// 서명된 문서 다운로드를 위한 정보 조회 API
app.get('/api/documents/:documentId/signed', async (req, res) => {
  try {
    const { documentId } = req.params;
    const document = await Document.findOne({ documentId: Number(documentId) });

    if (!document) {
      return res.status(404).json({ error: '문서를 찾을 수 없습니다.' });
    }

    // 문서에 있는 모든 서명 위치의 서명 ID 추출
    const signatureIds = document.signaturePositions
      .filter(pos => pos.signed && pos.signatureId)
      .map(pos => pos.signatureId);

    // 고유한 서명 ID만 남기기
    const uniqueSignatureIds = [...new Set(signatureIds)];

    // 해당하는 서명 이미지 조회
    const signatures = await Signature.find({ signatureId: { $in: uniqueSignatureIds } });

    // 서명 위치와 이미지를 결합한 응답 데이터 생성
    const signedDocument = {
      ...document.toObject(),
      signaturePositions: document.signaturePositions.map(pos => {
        if (pos.signed && pos.signatureId) {
          const signature = signatures.find(sig => sig.signatureId === pos.signatureId);
          return {
            ...pos.toObject(),
            signatureImage: signature ? signature.signatureImage : null
          };
        }
        return pos.toObject();
      })
    };

    res.json({ document: signedDocument });
  } catch (error) {
    console.error('서명된 문서 조회 오류:', error);
    res.status(500).json({ error: '서명된 문서 조회 중 오류가 발생했습니다.' });
  }
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
}); 