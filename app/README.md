# 방문자 카운터 애플리케이션

FastAPI 백엔드와 Next.js 프론트엔드로 구성된 간단한 방문자 카운터 애플리케이션입니다.

## 🎯 주요 기능
- 클릭 시 방문자 수 증가
- 실시간 방문자 카운터 표시
- 그라데이션 배경의 모던한 UI
- Docker Compose로 간편한 실행

## 📁 앱 구조

```
app/
├── docker-compose.yml       # Docker Compose 설정 파일
├── README.md               # 이 문서
│
├── backend/                 # FastAPI 백엔드 애플리케이션
│   ├── main.py             # API 엔드포인트 정의
│   ├── pyproject.toml      # Python 프로젝트 설정 (uv 사용)
│   ├── Dockerfile          # Docker 이미지 빌드 설정
│   ├── .dockerignore       # Docker 빌드 제외 파일
│   └── data/               # 방문자 데이터 저장 (자동 생성)
│
└── frontend/               # Next.js 프론트엔드 애플리케이션
    ├── app/                # Next.js 13+ App Router
    │   ├── page.tsx        # 메인 페이지 컴포넌트
    │   └── layout.tsx      # 레이아웃 컴포넌트
    ├── public/             # 정적 파일
    ├── package.json        # Node.js 프로젝트 설정
    ├── tsconfig.json       # TypeScript 설정
    ├── next.config.js      # Next.js 설정
    ├── Dockerfile          # Docker 이미지 빌드 설정
    └── .dockerignore       # Docker 빌드 제외 파일
```

## 🉰️ 빠른 시작 (Docker Compose)

```bash
# 1. 프로젝트 디렉토리로 이동
cd app

# 2. Docker Compose로 실행
docker compose up -d --build

# 3. 브라우저에서 확인
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API 문서: http://localhost:8000/docs

# 4. 종료
docker compose down
```

## 🚀 로컬 실행 방법 (개발용)

### Backend 실행

1. **Python 환경 설정** (Python 3.11+ 필요)
```bash
cd app/backend

# uv 설치 (없는 경우)
pip install uv

# 가상환경 생성 및 활성화
uv venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# 의존성 설치
uv pip install -e .
```

2. **애플리케이션 실행**
```bash
# 개발 모드로 실행 (자동 리로드)
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 또는 Python으로 직접 실행
python main.py
```

3. **API 테스트**
```bash
# 헬스체크
curl http://localhost:8000/healthcheck

# 방문자 수 조회
curl http://localhost:8000/visit

# 방문자 수 증가
curl -X POST http://localhost:8000/visit
```

### Frontend 실행

1. **Node.js 환경 설정** (Node.js 18+ 필요)
```bash
cd app/frontend

# 의존성 설치
npm install
```

2. **개발 서버 실행**
```bash
# 개발 모드로 실행
npm run dev

# 프로덕션 빌드
npm run build
npm start
```

3. **브라우저에서 확인**
- http://localhost:3000 접속
- 중앙의 버튼을 클릭하여 방문자 수 증가

## 🐳 Docker 실행 방법

### Backend Docker 실행

```bash
cd app/backend

# 이미지 빌드
docker build -t visitor-backend:latest .

# 컨테이너 실행
docker run -d \
  --name visitor-backend \
  -p 8000:8000 \
  -v $(pwd)/data:/app/data \
  visitor-backend:latest
```

### Frontend Docker 실행

```bash
cd app/frontend

# 이미지 빌드
docker build -t visitor-frontend:latest .

# 컨테이너 실행 (백엔드 URL 설정)
docker run -d \
  --name visitor-frontend \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:8000 \
  visitor-frontend:latest
```

### Docker Compose로 한번에 실행

```bash
cd app

# 실행 (docker-compose.yml 파일이 이미 존재함)
docker compose up -d --build

# 로그 확인
docker compose logs -f

# 상태 확인
docker compose ps

# 종료
docker compose down

# 볼륨까지 삭제
docker compose down -v
```

## 📝 API 엔드포인트 상세

### Backend API

| 엔드포인트 | 메소드 | 설명 | 응답 예시 |
|-----------|--------|------|----------|
| `/` | GET | API 정보 | `{"message": "Visitor Counter API", "endpoints": {...}}` |
| `/healthcheck` | GET | 헬스체크 | `{"status": "healthy", "timestamp": "2024-01-15T12:00:00"}` |
| `/visit` | GET | 방문자 수 조회 | `{"count": 42, "last_visit": "2024-01-15T12:00:00"}` |
| `/visit` | POST | 방문자 수 증가 | `{"count": 43, "last_visit": "2024-01-15T12:00:01"}` |

### 데이터 저장 방식
- Backend는 `data/visitors.json` 파일에 방문 기록 저장
- 최근 100개의 방문 기록만 유지
- 형식:
```json
{
  "count": 42,
  "visits": [
    "2024-01-15T12:00:00",
    "2024-01-15T12:00:01"
  ]
}
```

## 🔧 환경 변수

### Backend
- `HOST`: 서버 호스트 (기본값: 0.0.0.0)
- `PORT`: 서버 포트 (기본값: 8000)

### Frontend
- `NEXT_PUBLIC_API_URL`: Backend API URL (기본값: http://localhost:8000)
  - Docker Compose 사용 시: `http://backend:8000` (서비스 간 통신)
  - 로컬 개발 시: `http://localhost:8000`

## 🧪 개발 팁

### Backend 개발
```bash
# 자동 리로드로 개발
uvicorn main:app --reload

# 대화형 API 문서 확인
# http://localhost:8000/docs (Swagger UI)
# http://localhost:8000/redoc (ReDoc)
```

### Frontend 개발
```bash
# 환경변수 설정 (.env.local)
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# 개발 서버 실행
npm run dev
```

## 🐞 문제 해결

### CORS 오류
- Backend의 CORS 설정 확인
- 프로덕션에서는 `allow_origins`를 특정 도메인으로 제한

### 연결 오류
- Backend가 실행 중인지 확인
- Frontend의 `NEXT_PUBLIC_API_URL` 환경변수 확인
- 방화벽/네트워크 설정 확인

### Docker Compose 문제
- 컨테이너 상태 확인: `docker compose ps`
- 로그 확인: `docker compose logs backend` 또는 `docker compose logs frontend`
- 네트워크 확인: `docker network ls`
- 재시작: `docker compose restart`

### 데이터 초기화
```bash
# Backend 데이터 초기화
rm -rf app/backend/data/visitors.json

# Docker 볼륨 초기화
docker compose down -v
```