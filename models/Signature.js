const mongoose = require('mongoose');

// 서명 데이터를 위한 스키마 정의
const signatureSchema = new mongoose.Schema({
  // 서명 고유 ID
  signatureId: {
    type: String,
    required: true,
    unique: true
  },
  // 서명 이미지 (Base64 문자열)
  signatureImage: {
    type: String,
    required: true
  },
  // 문서 ID
  documentId: {
    type: Number,
    required: true
  },
  // 서명 위치 정보
  positions: [{
    id: String,
    x: Number,
    y: Number,
    width: Number,
    height: Number,
    signed: {
      type: Boolean,
      default: true
    }
  }],
  // 생성 일시
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 모델 생성 및 내보내기
const Signature = mongoose.model('Signature', signatureSchema);

module.exports = Signature; 