# syntax=docker/dockerfile:1
FROM node:18-slim AS base

# uv 설치 (Node.js 패키지 관리에도 사용 가능)
RUN npm install -g uv

FROM base AS deps
WORKDIR /app

# 의존성 파일 복사
COPY package.json ./

# npm을 사용하여 의존성 설치
RUN npm install

FROM base AS builder
WORKDIR /app

# 의존성 복사
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build argument for API URL
ARG NEXT_PUBLIC_API_URL=http://localhost:8000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Next.js 빌드
RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# 필요한 파일만 복사
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 포트 노출
EXPOSE 3000

# 애플리케이션 실행
CMD ["node", "server.js"]