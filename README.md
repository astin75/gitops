# GitOps Tutorial with ArgoCD

이 저장소는 ArgoCD를 사용한 GitOps 튜토리얼입니다. Dev와 Prod 환경을 분리하여 관리하는 방법을 보여줍니다.

## 📁 폴더 구조

```
gitops/
├── argocd/                    # ArgoCD 관련 설정
│   ├── install.yaml          # ArgoCD 설치 매니페스트
│   ├── app-dev.yaml         # Dev 환경 Application
│   └── app-prod.yaml        # Prod 환경 Application
├── namespaces/               # 네임스페이스 정의
│   ├── dev.yaml             # Dev 네임스페이스
│   └── prod.yaml            # Prod 네임스페이스
├── applications/             # 애플리케이션 매니페스트
│   ├── dev/                 # Dev 환경 설정
│   │   ├── deployment.yaml  # Dev 배포 설정
│   │   ├── service.yaml     # Dev 서비스
│   │   ├── configmap.yaml   # Dev 설정
│   │   └── ingress.yaml.disabled  # Dev 인그레스 (비활성화됨)
│   └── prod/                # Prod 환경 설정
│       ├── deployment.yaml  # Prod 배포 설정 (더 많은 리소스)
│       ├── service.yaml     # Prod 서비스
│       ├── configmap.yaml   # Prod 설정 (보안 강화)
│       └── ingress.yaml.disabled  # Prod 인그레스 (비활성화됨)
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
```bash
# 초기 admin 비밀번호 확인
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath='{.data.password}' | base64 -d && echo



# 포트 포워딩으로 ArgoCD UI 접속
kubectl port-forward svc/argocd-server -n argocd 8080:443

# CLI로 로그인 (HTTPS 무시)
argocd login localhost:8080 --username admin --password '비밀번호' --insecure

# 브라우저에서 https://localhost:8080 접속
# Username: admin
# Password: 위에서 확인한 비밀번호
```

### 5. Git 저장소 설정
ArgoCD Application 매니페스트에서 Git 저장소 URL을 수정합니다:
```bash
# argocd/app-dev.yaml과 argocd/app-prod.yaml 파일에서
# repoURL을 본인의 Git 저장소 URL로 변경
sed -i 's|https://github.com/YOUR_USERNAME/gitops.git|YOUR_ACTUAL_REPO_URL|g' argocd/app-*.yaml
```

### 6. ArgoCD Applications 생성
```bash
# Dev 환경 애플리케이션 생성
kubectl apply -f argocd/app-dev.yaml

# Prod 환경 애플리케이션 생성
kubectl apply -f argocd/app-prod.yaml
```

### 7. 배포 확인
```bash
# Dev 환경 확인
kubectl get all -n dev

# Prod 환경 확인
kubectl get all -n prod

# ArgoCD CLI로 상태 확인 (선택사항)
argocd app list
argocd app get sample-app-dev
argocd app get sample-app-prod
```

## 📝 주요 차이점 (Dev vs Prod)

### Dev 환경
- **Replicas**: 2개 (빠른 테스트)
- **리소스**: 적음 (CPU: 100m-200m, Memory: 128Mi-256Mi)
- **자동 동기화**: 활성화 (selfHeal: true)
- **디버그**: 활성화
- **Service**: NodePort (30030: Frontend, 30080: Backend)

### Prod 환경
- **Replicas**: 3개 (고가용성)
- **리소스**: 많음 (CPU: 250m-500m, Memory: 256Mi-512Mi)
- **자동 동기화**: 비활성화 (수동 승인 필요)
- **헬스체크**: Liveness/Readiness 프로브 설정
- **보안**: 강화된 nginx 설정, SSL 활성화
- **Service**: NodePort (필요 시 LoadBalancer로 변경 가능)

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
- **Frontend**: Next.js 기반 UI (포트 30030)
- **Backend**: FastAPI 기반 API (포트 30080)
- **이미지**: `astin75/visitor-frontend:202506151630`, `astin75/visitor-backend:202506151630`

## 🚀 EC2 Minikube 배포 가이드

이 프로젝트는 EC2의 Minikube 환경에 최적화되어 있습니다. Ingress 대신 NodePort를 사용하여 간단하게 배포할 수 있습니다.

### EC2 보안 그룹 설정
EC2 인스턴스의 보안 그룹에서 다음 포트를 열어주세요:
- **30030**: Frontend (방문자 카운터 UI)
- **30080**: Backend API
- **8080**: ArgoCD UI (선택사항)

### 접속 방법
```bash
# Frontend 접속
http://YOUR_EC2_PUBLIC_IP:30030

# Backend API 접속
http://YOUR_EC2_PUBLIC_IP:30080

# API 문서 확인
http://YOUR_EC2_PUBLIC_IP:30080/docs
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