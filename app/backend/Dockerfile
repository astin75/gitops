# syntax=docker/dockerfile:1
FROM python:3.11-slim

# 필요한 패키지 설치
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# uv 설치
RUN pip install uv

WORKDIR /app

# 의존성 파일 복사
COPY pyproject.toml ./

# uv를 사용하여 가상환경 생성 및 의존성 설치
RUN uv venv && \
    . .venv/bin/activate && \
    uv pip install fastapi uvicorn[standard] pydantic

# 애플리케이션 코드 복사
COPY . .

# 데이터 디렉토리 생성
RUN mkdir -p /app/data

# 포트 노출
EXPOSE 8000

# 애플리케이션 실행
CMD [".venv/bin/uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
# build x