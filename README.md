# GitOps Tutorial with ArgoCD

ArgoCD를 사용한 GitOps 튜토리얼입니다. Dev와 Prod 환경을 분리하여 방문자 카운터 애플리케이션을 배포합니다.

## 📁 프로젝트 구조

```
gitops/
├── .github/
│   └── workflows/            # GitHub Actions
│       ├── gitops-deploy.yml # 자동 빌드 및 배포
│       └── pr-check.yml      # PR 빌드 테스트
├── argocd/                    # ArgoCD 설정
│   ├── install.yaml          # ArgoCD 네임스페이스
│   ├── argocd-server-nodeport.yaml  # NodePort 서비스
│   ├── app-of-apps.yaml      # Main 브랜치 App of Apps
│   ├── applications/         # App of Apps 관리
│   ├── applications-dev/     # Dev 브랜치 Applications
│   └── applications-prod/    # Prod 브랜치 Applications
├── namespaces/               # 네임스페이스 정의
├── applications/             # 애플리케이션 매니페스트
│   ├── dev/                 # Dev 환경
│   │   ├── frontend/        
│   │   └── backend/         
│   └── prod/                # Prod 환경
│       ├── frontend/        
│       └── backend/         
├── app/                      # 애플리케이션 소스 코드
│   ├── frontend/            # Next.js Frontend
│   └── backend/             # FastAPI Backend
└── README.md
```

## 🚀 빠른 시작

```bash
# 1. 저장소 클론 및 브랜치 설정
git clone https://github.com/astin75/gitops
cd gitops
./scripts/setup-branches.sh  # dev, prod 브랜치 자동 생성

# 2. 기본 설치
kubectl apply -f namespaces/
kubectl apply -f argocd/install.yaml
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl apply -f argocd/argocd-server-nodeport.yaml

# 3. ArgoCD App of Apps 생성 (모든 애플리케이션 자동 배포)
kubectl apply -f argocd/app-of-apps.yaml

# 4. ArgoCD UI 접속
minikube service argocd-server-nodeport -n argocd
# Username: admin
# Password: kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath='{.data.password}' | base64 -d

# 5. 애플리케이션 접속
minikube service visitor-frontend-service -n dev  # Dev Frontend
minikube service visitor-backend-service -n dev   # Dev Backend
```

## 🎯 애플리케이션 정보

**방문자 카운터 애플리케이션**
- **Frontend**: Next.js UI (방문자 수 표시 및 증가)
  - 설정 버튼(⚙️)으로 Backend URL 입력 가능
  - 이미지: `astin75/visitor-frontend:202506152110`
- **Backend**: FastAPI API (방문자 수 저장/조회)
  - 이미지: `astin75/visitor-backend:202506151630`

### Frontend 설정 방법
1. Frontend 페이지 우측 상단 ⚙️ 버튼 클릭
2. Backend URL 입력 (예: `http://192.168.49.2:30080`)
3. 저장

## 📊 환경별 차이점

| 구분 | Dev | Prod |
|------|-----|------|
| Replicas | 1개 | 2개 |
| 리소스 | 적음 (100m/128Mi) | 많음 (250m/256Mi) |
| 자동 동기화 | 활성화 | 비활성화 |
| Frontend Port | 30030 | 31030 |
| Backend Port | 30080 | 31080 |
| PersistentVolume | X | O |

## 🔌 서비스 포트

### Minikube (로컬)
```bash
# Backend URL 확인
minikube service visitor-backend-service -n dev --url
```

### EC2 환경
```bash
# Dev
http://EC2_IP:30030  # Frontend
http://EC2_IP:30080  # Backend

# Prod
http://EC2_IP:31030  # Frontend  
http://EC2_IP:31080  # Backend

# ArgoCD
http://EC2_IP:30200  # HTTP
http://EC2_IP:30443  # HTTPS
```

## 🔧 GitOps 워크플로우

### 자동화된 CI/CD 파이프라인
1. **코드 변경** → feature 브랜치에서 작업
2. **PR 생성** → dev 또는 prod 브랜치로 PR
3. **자동 빌드 테스트** → PR 시 Docker 빌드 검증
4. **Merge 시 자동 배포**:
   - Docker 이미지 빌드 및 푸시 (태그: YYYYMMDDHH)
   - Kubernetes 매니페스트 자동 업데이트
   - ArgoCD가 변경사항 감지 및 배포

### 브랜치 전략
```
feature/* → dev → prod
          ↓     ↓
        Dev Apps  Prod Apps
```
- `main`: ArgoCD 설정 및 App of Apps 관리
- `dev`: Dev 환경 배포 (자동 동기화)
- `prod`: Prod 환경 배포 (수동 승인)

각 브랜치는 해당 환경의 manifest만 추적합니다.

### ArgoCD CLI 명령어
```bash
argocd app list
argocd app sync visitor-frontend-dev
argocd app get applications  # App of Apps 상태
```

## 📝 주의사항

- Production에서는 Git 저장소를 private으로 설정
- ArgoCD 초기 비밀번호 변경 필수
- Secrets는 Sealed Secrets 사용 권장
- EC2 사용 시 보안 그룹에서 NodePort 포트 개방 필요

### GitHub Actions 설정
Repository Settings → Secrets and variables → Actions에서 설정:
- `DOCKER_USERNAME`: Docker Hub 사용자명
- `DOCKER_PASSWORD`: Docker Hub 비밀번호 또는 Access Token
- `PAT` (선택사항): Personal Access Token - 자동 manifest 업데이트를 위해 필요

## 📚 참고 자료

- [ArgoCD 문서](https://argo-cd.readthedocs.io/)
- [GitOps 원칙](https://www.gitops.tech/)
- [프로젝트 저장소](https://github.com/astin75/gitops)