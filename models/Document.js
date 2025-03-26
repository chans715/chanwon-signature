const mongoose = require('mongoose');

// 서명 위치 정보를 위한 하위 스키마
const signaturePositionSchema = new mongoose.Schema({
  id: String,
  x: Number,
  y: Number,
  width: Number,
  height: Number,
  signed: {
    type: Boolean,
    default: false
  },
  signatureId: {
    type: String,
    default: null
  }
});

// 문서 데이터를 위한 스키마 정의
const documentSchema = new mongoose.Schema({
  // 문서 고유 ID
  documentId: {
    type: Number,
    required: true,
    unique: true
  },
  // 문서 이미지 URL
  imageUrl: {
    type: String,
    required: true
  },
  // PDF URL (있는 경우)
  pdfUrl: {
    type: String
  },
  // 문서 타입
  type: {
    type: String,
    default: 'image'
  },
  // 서명 위치 정보
  signaturePositions: [signaturePositionSchema],
  // 서명된 상태인지
  isSigned: {
    type: Boolean,
    default: false
  },
  // 생성 일시
  createdAt: {
    type: Date,
    default: Date.now
  },
  // 최종 수정 일시
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 모델 생성 및 내보내기
const Document = mongoose.model('Document', documentSchema);

module.exports = Document; 