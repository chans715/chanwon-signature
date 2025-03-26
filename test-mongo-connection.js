require('dotenv').config();
const mongoose = require('mongoose');

// 환경 변수에서 연결 문자열 가져오기
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error('오류: MONGO_URI 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

// 연결 문자열 마스킹 (보안을 위해 로그에 비밀번호 감추기)
const maskedURI = mongoURI.replace(/(mongodb:\/\/[^:]+:)[^@]+@/, '$1****@');
console.log('MongoDB 연결을 시도합니다...');
console.log(`연결 문자열: ${maskedURI}`);

mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB 연결 성공! 데이터베이스가 정상적으로 연결되었습니다.');
    
    // 연결된 데이터베이스 정보 출력
    const db = mongoose.connection.db;
    console.log(`연결된 데이터베이스 이름: ${db.databaseName}`);
    
    // 컬렉션 목록 확인
    db.listCollections().toArray()
      .then(collections => {
        if (collections.length === 0) {
          console.log('데이터베이스에 컬렉션이 없습니다.');
        } else {
          console.log('데이터베이스 컬렉션 목록:');
          collections.forEach(collection => {
            console.log(`- ${collection.name}`);
          });
        }
        
        // 연결 종료
        mongoose.connection.close();
        console.log('테스트 완료. 연결이 종료되었습니다.');
      })
      .catch(err => {
        console.error('컬렉션 목록 조회 실패:', err);
        mongoose.connection.close();
      });
  })
  .catch(err => {
    console.error('MongoDB 연결 실패:', err);
    console.error('오류 내용:', err.message);
    process.exit(1);
  }); 