require('dotenv').config();
const mongoose = require('mongoose');

// MongoDB 연결
const connectToMongoDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      console.error('MongoDB 연결 문자열(MONGO_URI)이 설정되지 않았습니다.');
      process.exit(1);
    }

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('MongoDB에 성공적으로 연결되었습니다.');
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB 연결 중 오류가 발생했습니다:', error);
    process.exit(1);
  }
};

// 불필요한 데이터 정리
const cleanupData = async (connection) => {
  try {
    console.log('========== 불필요한 데이터 정리 시작 ==========');
    
    // 1. 테스트 문서 삭제 (30일 이상 지난 문서)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Document 컬렉션에서 오래된 문서 삭제
    const documentResult = await connection.collection('documents').deleteMany({
      createdAt: { $lt: thirtyDaysAgo }
    });
    console.log(`오래된 문서 ${documentResult.deletedCount}개가 삭제되었습니다.`);
    
    // Signature 컬렉션에서 오래된 서명 삭제
    const signatureResult = await connection.collection('signatures').deleteMany({
      createdAt: { $lt: thirtyDaysAgo }
    });
    console.log(`오래된 서명 ${signatureResult.deletedCount}개가 삭제되었습니다.`);
    
    // 2. 불완전한 문서 삭제 (서명되지 않은 상태로 오래된 문서)
    const incompleteResult = await connection.collection('documents').deleteMany({
      isSigned: false,
      createdAt: { $lt: thirtyDaysAgo }
    });
    console.log(`미완성 문서 ${incompleteResult.deletedCount}개가 삭제되었습니다.`);
    
    // 3. 고아 서명 삭제 (연결된 문서가 없는 서명)
    const documents = await connection.collection('documents').find({}, { _id: 1, documentId: 1 }).toArray();
    const documentIds = documents.map(doc => doc.documentId);
    
    const orphanSignatureResult = await connection.collection('signatures').deleteMany({
      documentId: { $nin: documentIds }
    });
    console.log(`고아 서명 ${orphanSignatureResult.deletedCount}개가 삭제되었습니다.`);
    
    console.log('========== 불필요한 데이터 정리 완료 ==========');
  } catch (error) {
    console.error('데이터 정리 중 오류가 발생했습니다:', error);
  }
};

// 인덱스 설정
const setupIndexes = async (connection) => {
  try {
    console.log('========== 인덱스 설정 시작 ==========');
    
    // 1. Document 컬렉션 인덱스
    await connection.collection('documents').createIndex({ documentId: 1 }, { unique: true });
    console.log('documents 컬렉션에 documentId 인덱스를 생성했습니다.');
    
    await connection.collection('documents').createIndex({ createdAt: 1 });
    console.log('documents 컬렉션에 createdAt 인덱스를 생성했습니다.');
    
    await connection.collection('documents').createIndex({ isSigned: 1 });
    console.log('documents 컬렉션에 isSigned 인덱스를 생성했습니다.');
    
    // 2. Signature 컬렉션 인덱스
    await connection.collection('signatures').createIndex({ signatureId: 1 }, { unique: true });
    console.log('signatures 컬렉션에 signatureId 인덱스를 생성했습니다.');
    
    await connection.collection('signatures').createIndex({ documentId: 1 });
    console.log('signatures 컬렉션에 documentId 인덱스를 생성했습니다.');
    
    await connection.collection('signatures').createIndex({ createdAt: 1 });
    console.log('signatures 컬렉션에 createdAt 인덱스를 생성했습니다.');
    
    console.log('========== 인덱스 설정 완료 ==========');
  } catch (error) {
    console.error('인덱스 설정 중 오류가 발생했습니다:', error);
  }
};

// 데이터베이스 통계 확인
const checkDatabaseStats = async (connection) => {
  try {
    console.log('========== 데이터베이스 통계 ==========');
    
    // 컬렉션별 문서 수 확인
    const documentCount = await connection.collection('documents').countDocuments();
    console.log(`documents 컬렉션: ${documentCount}개 문서`);
    
    const signatureCount = await connection.collection('signatures').countDocuments();
    console.log(`signatures 컬렉션: ${signatureCount}개 문서`);
    
    // 인덱스 정보 확인
    const documentIndexes = await connection.collection('documents').indexes();
    console.log('documents 컬렉션 인덱스:', documentIndexes.map(idx => idx.name).join(', '));
    
    const signatureIndexes = await connection.collection('signatures').indexes();
    console.log('signatures 컬렉션 인덱스:', signatureIndexes.map(idx => idx.name).join(', '));
    
    console.log('========== 데이터베이스 통계 완료 ==========');
  } catch (error) {
    console.error('데이터베이스 통계 확인 중 오류가 발생했습니다:', error);
  }
};

// 메인 함수
const main = async () => {
  let connection;
  try {
    connection = await connectToMongoDB();
    
    // 불필요한 데이터 정리
    await cleanupData(connection);
    
    // 인덱스 설정
    await setupIndexes(connection);
    
    // 데이터베이스 통계 확인
    await checkDatabaseStats(connection);
    
    console.log('MongoDB 최적화가 성공적으로 완료되었습니다.');
  } catch (error) {
    console.error('MongoDB 최적화 중 오류가 발생했습니다:', error);
  } finally {
    if (connection) {
      await mongoose.disconnect();
      console.log('MongoDB 연결이 종료되었습니다.');
    }
  }
};

// 스크립트 실행
main(); 