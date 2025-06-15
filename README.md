# GitOps Tutorial with ArgoCD

이 저장소는 ArgoCD를 사용한 GitOps 튜토리얼입니다. Dev와 Prod 환경을 분리하여 관리하는 방법을 보여줍니다.

## 📁 폴더 구조

```
gitops/
├── argocd/                    # ArgoCD 관련 설정
│   ├── install.yaml          # ArgoCD 설치 매니페스트
│   ├── argocd-server-nodeport.yaml  # ArgoCD NodePort 서비스
│   ├── app-of-apps.yaml      # App of Apps 패턴 (모든 앱 관리)
│   └── applications/         # 개별 Application 정의
│       ├── dev-frontend.yaml
│       ├── dev-backend.yaml
│       ├── prod-frontend.yaml
│       ├── prod-backend.yaml
│       └── kustomization.yaml
├── namespaces/               # 네임스페이스 정의
│   ├── dev.yaml             # Dev 네임스페이스
│   └── prod.yaml            # Prod 네임스페이스
├── applications/             # 애플리케이션 매니페스트
│   ├── dev/                 # Dev 환경 설정
│   │   ├── frontend/        # Frontend 서비스
│   │   │   ├── deployment.yaml
│   │   │   └── service.yaml
│   │   ├── backend/         # Backend 서비스
│   │   │   ├── deployment.yaml
│   │   │   └── service.yaml
│   │   └── configmap.yaml   # 설정
│   └── prod/                # Prod 환경 설정
│       ├── frontend/        # Frontend 서비스
│       │   ├── deployment.yaml
│       │   └── service.yaml
│       ├── backend/         # Backend 서비스 (PVC 포함)
│       │   ├── deployment.yaml
│       │   └── service.yaml
│       └── configmap.yaml   # 설정
└── README.md
```

## 🚀 실행 순서

### 1. 사전 준비
```bash
# Git 저장소 클론
git clone https://github.com/YOUR_USERNAME/gitops.git
cd gitops

# Kubernetes 클러스터 확인
kubectl cluster-info
```

### 2. 네임스페이스 생성
Dev와 Prod 환경을 위한 네임스페이스를 생성합니다.
```bash
kubectl apply -f namespaces/
```

### 3. ArgoCD 설치
```bash
# ArgoCD 네임스페이스 생성
kubectl apply -f argocd/install.yaml

# ArgoCD 공식 매니페스트로 설치
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# ArgoCD 서버가 준비될 때까지 대기
kubectl wait --for=condition=available --timeout=600s deployment/argocd-server -n argocd
```

### 4. ArgoCD 접속

#### Minikube service 사용
```bash
# ArgoCD NodePort 서비스 생성
kubectl apply -f argocd/argocd-server-nodeport.yaml

# 초기 admin 비밀번호 확인
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath='{.data.password}' | base64 -d && echo

# ArgoCD UI 열기 (브라우저가 자동으로 열림)
minikube service argocd-server-nodeport -n argocd

# Username: admin
# Password: 위에서 확인한 비밀번호
```

#### 포트 포워딩 사용 (대안)
```bash
# 초기 admin 비밀번호 확인
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath='{.data.password}' | base64 -d && echo

# 포트 포워딩으로 ArgoCD UI 접속
kubectl port-forward svc/argocd-server -n argocd 8080:443

# 브라우저에서 https://localhost:8080 접속
# Username: admin
# Password: 위에서 확인한 비밀번호
```

### 5. ArgoCD Applications 생성 (App of Apps 패턴)

#### 방법 1: App of Apps 패턴 (권장)
하나의 Application으로 모든 애플리케이션을 관리합니다:
```bash
# App of Apps 생성 - 모든 애플리케이션이 자동으로 생성됩니다
kubectl apply -f argocd/app-of-apps.yaml
```

#### 방법 2: 개별 Application 생성
각 애플리케이션을 개별적으로 생성하려면:
```bash
# 모든 애플리케이션 한번에 생성
kubectl apply -f argocd/applications/

# 또는 개별적으로 생성
kubectl apply -f argocd/applications/dev-frontend.yaml
kubectl apply -f argocd/applications/dev-backend.yaml
kubectl apply -f argocd/applications/prod-frontend.yaml
kubectl apply -f argocd/applications/prod-backend.yaml
```

### 7. 배포 확인
```bash
# Dev 환경 확인
kubectl get all -n dev

# Prod 환경 확인
kubectl get all -n prod

# ArgoCD CLI로 상태 확인 (선택사항)
argocd app list
argocd app get visitor-frontend-dev
argocd app get visitor-backend-dev
argocd app get visitor-frontend-prod
argocd app get visitor-backend-prod

# 또는 App of Apps 상태 확인
argocd app get applications
```

## 📝 주요 차이점 (Dev vs Prod)

### Dev 환경
- **Replicas**: 1개 (빠른 테스트)
- **리소스**: 적음 (CPU: 100m-200m, Memory: 128Mi-256Mi)
- **자동 동기화**: 활성화 (selfHeal: true)
- **디버그**: 활성화
- **Service**: 
  - Frontend: NodePort 30030
  - Backend: NodePort 30080

### Prod 환경
- **Replicas**: 2개 (고가용성)
- **리소스**: 많음 (CPU: 250m-500m, Memory: 256Mi-512Mi)
- **자동 동기화**: 비활성화 (수동 승인 필요)
- **헬스체크**: Liveness/Readiness 프로브 설정
- **PersistentVolume**: Backend 데이터 영구 저장
- **Service**: 
  - Frontend: NodePort 31030
  - Backend: NodePort 31080

## 🔧 커스터마이징

### 애플리케이션 이미지 변경
`applications/*/deployment.yaml` 파일에서 이미지를 변경:
```yaml
image: your-registry/your-app:tag
```

### 환경 변수 추가
ConfigMap을 수정하거나 Deployment에 직접 추가:
```yaml
env:
- name: NEW_VAR
  value: "value"
```

### 스케일링
```bash
# 수동 스케일링 (GitOps 원칙에 어긋남 - 테스트용)
kubectl scale deployment sample-app -n dev --replicas=5

# GitOps 방식 - deployment.yaml 수정 후 commit & push
```

### 애플리케이션 정보
이 GitOps 프로젝트는 방문자 카운터 애플리케이션을 배포합니다:
- **Frontend**: Next.js 기반 UI (중앙 버튼 클릭 시 카운터 증가)
  - 설정 버튼을 통해 Backend URL을 브라우저에서 직접 입력 가능
  - 이미지: `astin75/visitor-frontend:202506152110`
- **Backend**: FastAPI 기반 API (방문자 수 저장 및 조회)
  - 이미지: `astin75/visitor-backend:202506151630`

### ArgoCD Application 구조
이 프로젝트는 "App of Apps" 패턴을 사용하여 모든 애플리케이션을 관리합니다:
- **applications**: 모든 ArgoCD Application을 관리하는 상위 App
  - **visitor-frontend-dev**: Dev Frontend 애플리케이션
  - **visitor-backend-dev**: Dev Backend 애플리케이션  
  - **visitor-frontend-prod**: Prod Frontend 애플리케이션
  - **visitor-backend-prod**: Prod Backend 애플리케이션

각 애플리케이션은 Git 저장소의 특정 경로를 모니터링하고 자동으로 동기화합니다.

### 빠른 시작 가이드 (macOS Minikube)
```bash
# 1. 저장소 클론 및 설정
git clone https://github.com/astin75/gitops
cd gitops

# 2. 네임스페이스 및 ArgoCD 설치
kubectl apply -f namespaces/
kubectl apply -f argocd/install.yaml
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl apply -f argocd/argocd-server-nodeport.yaml

# 3. ArgoCD App of Apps 생성 (모든 애플리케이션 자동 생성)
kubectl apply -f argocd/app-of-apps.yaml

# 4. 모든 서비스 접속 (브라우저가 자동으로 열림)
# ArgoCD UI
minikube service argocd-server-nodeport -n argocd
# 비밀번호: kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath='{.data.password}' | base64 -d

# Dev 환경
minikube service visitor-frontend-service -n dev  # Frontend
minikube service visitor-backend-service -n dev   # Backend

# Prod 환경
minikube service visitor-frontend-service -n prod # Frontend  
minikube service visitor-backend-service -n prod  # Backend
```

## 🚀 EC2 Minikube 배포 가이드

이 프로젝트는 EC2의 Minikube 환경에 최적화되어 있습니다. Ingress 대신 NodePort를 사용하여 간단하게 배포할 수 있습니다.

### EC2 보안 그룹 설정
EC2 인스턴스의 보안 그룹에서 다음 포트를 열어주세요:
- **30030**: Dev Frontend
- **30080**: Dev Backend
- **31030**: Prod Frontend
- **31080**: Prod Backend
- **30200, 30443**: ArgoCD UI

### 접속 방법

#### Minikube 로컬 환경 (macOS/Docker Driver)
```bash
# Minikube service 명령어로 모든 서비스 접속 (브라우저 자동 열림)

# ArgoCD UI
minikube service argocd-server-nodeport -n argocd

# Dev 환경
minikube service visitor-frontend-service -n dev  # Frontend 브라우저 자동 열림
minikube service visitor-backend-service -n dev   # Backend API

# URL만 확인하려면
minikube service visitor-backend-service -n dev --url

# Prod 환경
minikube service visitor-frontend-service -n prod # Frontend 브라우저 자동 열림
minikube service visitor-backend-service -n prod  # Backend API

# Frontend 설정 방법:
# 1. Frontend 페이지 우측 상단 ⚙️ 설정 버튼 클릭
# 2. Backend URL 입력 (예: http://192.168.49.2:30080)
# 3. 저장 버튼 클릭

```

#### EC2 환경
```bash
# Dev 환경
http://YOUR_EC2_PUBLIC_IP:30030    # Frontend
http://YOUR_EC2_PUBLIC_IP:30080    # Backend API

# Prod 환경
http://YOUR_EC2_PUBLIC_IP:31030    # Frontend
http://YOUR_EC2_PUBLIC_IP:31080    # Backend API

# Frontend에서 Backend 연결:
# 1. Frontend 페이지의 ⚙️ 설정 버튼 클릭
# 2. Backend URL 입력: http://YOUR_EC2_PUBLIC_IP:30080 (Dev) 또는 http://YOUR_EC2_PUBLIC_IP:31080 (Prod)
# 3. 저장
```

### Minikube Tunnel 사용 (선택사항)
```bash
# EC2에서 실행
minikube tunnel

# Service의 Cluster IP로 직접 접속 가능
kubectl get svc -n dev
```

### 왜 NodePort를 사용하나요?
- **간단한 설정**: Ingress Controller 설치 불필요
- **빠른 배포**: 추가 리소스 없이 바로 사용 가능
- **Minikube 최적화**: Minikube 환경에 가장 적합한 방식
- **보안**: EC2 보안 그룹으로 접근 제어 가능

## 📚 추가 학습 자료
- [ArgoCD 공식 문서](https://argo-cd.readthedocs.io/)
- [GitOps 원칙](https://www.gitops.tech/)
- [Kubernetes 문서](https://kubernetes.io/docs/)

## ⚠️ 주의사항
1. 실제 운영 환경에서는 Git 저장소를 private으로 설정하세요
2. ArgoCD 초기 비밀번호를 변경하세요
3. RBAC을 설정하여 권한을 제한하세요
4. Secrets는 Sealed Secrets나 외부 시크릿 관리 도구를 사용하세요