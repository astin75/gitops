# GitHub Secrets 설정

GitHub Actions가 정상적으로 작동하려면 다음 Secrets를 설정해야 합니다.

## 필수 Secrets

Repository Settings > Secrets and variables > Actions에서 설정:

1. **DOCKER_USERNAME**: Docker Hub 사용자명
2. **DOCKER_PASSWORD**: Docker Hub 비밀번호 또는 Access Token
3. **PAT** (선택사항): Personal Access Token - 자동 commit/push를 위해 필요

## 설정 방법

1. GitHub 저장소로 이동
2. Settings → Secrets and variables → Actions
3. "New repository secret" 클릭
4. 각 Secret 추가:
   - Name: `DOCKER_USERNAME`
   - Value: Docker Hub 사용자명 (예: astin75)
   
   - Name: `DOCKER_PASSWORD`
   - Value: Docker Hub 비밀번호

## Docker Hub Access Token 사용 (권장)

보안을 위해 비밀번호 대신 Access Token 사용을 권장합니다:

1. [Docker Hub](https://hub.docker.com) 로그인
2. Account Settings → Security → New Access Token
3. Token 이름 입력 및 권한 설정
4. 생성된 Token을 `DOCKER_PASSWORD`로 사용

## Personal Access Token (PAT) 생성

Workflow가 코드를 commit하고 push할 수 있도록 PAT가 필요합니다:

1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. "Generate new token" 클릭
3. 권한 설정:
   - `repo` (전체 저장소 접근)
   - `workflow` (GitHub Actions 워크플로우 업데이트)
4. 생성된 Token을 `PAT` Secret으로 저장

**참고**: PAT 없이도 작동하지만, 자동 manifest 업데이트가 실패할 수 있습니다.