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

// 쿼리 분석 함수
const analyzeQueries = async (connection) => {
  try {
    console.log('========== 쿼리 분석 시작 ==========');
    
    // 프로파일링 활성화
    await connection.db.command({ profile: 2, slowms: 100 });
    console.log('프로파일링이 활성화되었습니다. (100ms 이상 걸리는 쿼리 기록)');
    
    // 기존 프로파일링 데이터 확인
    const profileData = await connection.db.collection('system.profile').find({}).limit(5).toArray();
    
    if (profileData.length > 0) {
      console.log('\n최근 느린 쿼리:');
      profileData.forEach((query, index) => {
        console.log(`\n[쿼리 ${index + 1}]`);
        console.log(`컬렉션: ${query.ns}`);
        console.log(`실행 시간: ${query.millis}ms`);
        console.log(`쿼리: ${JSON.stringify(query.query || query.command)}`);
        
        // 쿼리 개선 제안
        if (query.millis > 500) {
          console.log('개선 제안: 이 쿼리는 매우 느립니다. 인덱스 추가를 고려하세요.');
          
          // 어떤 필드에 인덱스를 추가할지 제안
          const queryObj = query.query || (query.command && query.command.find ? query.command.filter : {});
          if (queryObj) {
            const fields = Object.keys(queryObj);
            if (fields.length > 0) {
              console.log(`다음 필드에 인덱스 추가를 고려하세요: ${fields.join(', ')}`);
            }
          }
        }
      });
    } else {
      console.log('아직 기록된 느린 쿼리가 없습니다.');
    }
    
    // 컬렉션별 쿼리 최적화 제안
    console.log('\n\n컬렉션별 쿼리 최적화 제안:');
    
    // Document 컬렉션 최적화
    console.log('\n[Document 컬렉션]');
    console.log('1. 서명 상태별 문서 조회 시 복합 인덱스를 사용하세요: { isSigned: 1, createdAt: -1 }');
    console.log('2. 사용자별 문서 조회 시 인덱스를 사용하세요: { userId: 1, createdAt: -1 }');
    console.log('3. 날짜 범위 쿼리에는 createdAt 인덱스를 활용하세요');
    
    // Signature 컬렉션 최적화
    console.log('\n[Signature 컬렉션]');
    console.log('1. 문서별 서명 조회 시 documentId 인덱스를 사용하세요');
    console.log('2. 사용자별 서명 조회 시 userId 필드에 인덱스 추가를 고려하세요');
    
    // 쿼리 예제 및 최적화 방법
    console.log('\n\n권장 쿼리 패턴:');
    
    console.log('\n[예제 1] 서명이 필요한 최근 문서 조회');
    console.log('최적화 전: db.documents.find({ isSigned: false })');
    console.log('최적화 후: db.documents.find({ isSigned: false }).sort({ createdAt: -1 }).limit(10)');
    console.log('이유: limit을 사용하여 필요한 문서만 가져오고, 인덱스를 활용한 정렬');
    
    console.log('\n[예제 2] 특정 문서의 서명 조회');
    console.log('최적화 전: db.signatures.find({ documentId: id })');
    console.log('최적화 후: db.signatures.find({ documentId: id }, { signatureImage: 0 }).projection()');
    console.log('이유: 큰 서명 이미지 데이터를 제외하고 필요한 필드만 가져와 네트워크 전송량 감소');
    
    console.log('\n[예제 3] 집계 쿼리 최적화');
    console.log('최적화 전: db.documents.aggregate([{ $match: { createdAt: { $gte: date } } }, { $group: { _id: "$status", count: { $sum: 1 } } }])');
    console.log('최적화 후: db.documents.aggregate([{ $match: { createdAt: { $gte: date } } }, { $group: { _id: "$status", count: { $sum: 1 } } }, { $hint: { createdAt: 1 } }])');
    console.log('이유: $hint를 사용하여 인덱스 사용을 명시적으로 지정');
    
    // 프로파일링 비활성화
    await connection.db.command({ profile: 0 });
    console.log('\n프로파일링이 비활성화되었습니다.');
    
    console.log('\n========== 쿼리 분석 완료 ==========');
  } catch (error) {
    console.error('쿼리 분석 중 오류가 발생했습니다:', error);
    // 오류가 발생해도 프로파일링은 비활성화
    try {
      await connection.db.command({ profile: 0 });
    } catch (e) {
      console.error('프로파일링 비활성화 중 오류:', e);
    }
  }
};

// 최적화된 쿼리 예제 실행
const runOptimizedQueries = async (connection) => {
  try {
    console.log('\n========== 최적화된 쿼리 실행 예제 ==========');
    
    // 예제 1: 문서 조회 시 프로젝션 사용
    console.log('\n[예제 1] 프로젝션을 사용한 문서 조회');
    console.time('문서 조회 (프로젝션 사용)');
    const docsWithProjection = await connection.collection('documents')
      .find({}, { projection: { documentId: 1, isSigned: 1, createdAt: 1 } })
      .limit(10)
      .toArray();
    console.timeEnd('문서 조회 (프로젝션 사용)');
    console.log(`조회된 문서 수: ${docsWithProjection.length}`);
    
    // 예제 2: 인덱스를 활용한 정렬 및 제한
    console.log('\n[예제 2] 인덱스를 활용한 정렬 및 제한');
    console.time('정렬 및 제한 쿼리');
    const sortedDocs = await connection.collection('documents')
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();
    console.timeEnd('정렬 및 제한 쿼리');
    console.log(`조회된 문서 수: ${sortedDocs.length}`);
    
    // 예제 3: 필터링에 인덱스 활용
    console.log('\n[예제 3] 필터링에 인덱스 활용');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    console.time('날짜 필터링 쿼리');
    const recentDocs = await connection.collection('documents')
      .find({ createdAt: { $gte: yesterday } })
      .toArray();
    console.timeEnd('날짜 필터링 쿼리');
    console.log(`최근 24시간 내 문서 수: ${recentDocs.length}`);
    
    console.log('\n========== 최적화된 쿼리 실행 완료 ==========');
  } catch (error) {
    console.error('최적화된 쿼리 실행 중 오류가 발생했습니다:', error);
  }
};

// 메인 함수
const main = async () => {
  let connection;
  try {
    connection = await connectToMongoDB();
    
    // 쿼리 분석
    await analyzeQueries(connection);
    
    // 최적화된 쿼리 예제 실행
    await runOptimizedQueries(connection);
    
    console.log('\nMongoDB 쿼리 최적화 분석이 완료되었습니다.');
  } catch (error) {
    console.error('MongoDB 쿼리 최적화 분석 중 오류가 발생했습니다:', error);
  } finally {
    if (connection) {
      await mongoose.disconnect();
      console.log('MongoDB 연결이 종료되었습니다.');
    }
  }
};

// 스크립트 실행
main(); 