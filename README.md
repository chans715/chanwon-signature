# 비대면 전자서명 서비스

이 프로젝트는 비대면 전자서명 서비스를 제공하는 웹 애플리케이션입니다. URL을 상대방 핸드폰으로 발송하여 전자서명을 진행할 수 있습니다.

## 주요 기능

1. **PASS 본인인증**: 안전한 전자서명을 위한 본인인증 기능
2. **안내문 설명**: 전자서명 관련 안내 및 법적 효력 설명
3. **전자서명 입력**: 모바일 터치패드를 통한 서명 입력
4. **신분증 사진 업로드**: 본인 확인을 위한 신분증 업로드
5. **전송 및 완료**: 서명 정보 전송 및 완료 확인

## 기술 스택

- **프론트엔드**: React, Next.js, TypeScript
- **스타일링**: Tailwind CSS
- **서명 기능**: HTML5 Canvas API

## 설치 및 실행 방법

1. 저장소 클론
```bash
git clone https://github.com/yourusername/electronic-signature-service.git
cd electronic-signature-service
```

2. 의존성 설치
```bash
npm install
```

3. 개발 서버 실행
```bash
npm run dev
```

4. 브라우저에서 확인
```
http://localhost:3000
```

## 프로젝트 구조

```
electronic-signature-service/
├── app/                    # Next.js 앱 디렉토리
│   ├── auth/               # 본인인증 페이지
│   ├── guide/              # 안내문 페이지
│   ├── signature/          # 전자서명 입력 페이지
│   ├── id-card/            # 신분증 업로드 페이지
│   ├── complete/           # 완료 페이지
│   └── layout.tsx          # 레이아웃 컴포넌트
├── components/             # 재사용 가능한 컴포넌트
│   └── SignaturePadClient.tsx  # 서명 패드 컴포넌트
├── styles/                 # 스타일 파일
│   └── globals.css         # 글로벌 스타일
├── public/                 # 정적 파일
├── next.config.js          # Next.js 설정
├── tailwind.config.js      # Tailwind CSS 설정
└── package.json            # 프로젝트 의존성 및 스크립트
```

## 라이센스

MIT 