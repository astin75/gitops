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
│   │   └── ingress.yaml     # Dev 인그레스
│   └── prod/                # Prod 환경 설정
│       ├── deployment.yaml  # Prod 배포 설정 (더 많은 리소스)
│       ├── service.yaml     # Prod 서비스
│       ├── configmap.yaml   # Prod 설정 (보안 강화)
│       └── ingress.yaml     # Prod 인그레스 (SSL 설정)
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
- **리소스**: 적음 (CPU: 250m-500m, Memory: 64Mi-128Mi)
- **자동 동기화**: 활성화 (selfHeal: true)
- **디버그**: 활성화
- **Ingress**: HTTP only

### Prod 환경
- **Replicas**: 3개 (고가용성)
- **리소스**: 많음 (CPU: 500m-1000m, Memory: 128Mi-256Mi)
- **자동 동기화**: 비활성화 (수동 승인 필요)
- **헬스체크**: Liveness/Readiness 프로브 설정
- **보안**: 강화된 nginx 설정, SSL 활성화
- **Ingress**: HTTPS with TLS

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

## 📚 추가 학습 자료
- [ArgoCD 공식 문서](https://argo-cd.readthedocs.io/)
- [GitOps 원칙](https://www.gitops.tech/)
- [Kubernetes 문서](https://kubernetes.io/docs/)

## ⚠️ 주의사항
1. 실제 운영 환경에서는 Git 저장소를 private으로 설정하세요
2. ArgoCD 초기 비밀번호를 변경하세요
3. RBAC을 설정하여 권한을 제한하세요
4. Secrets는 Sealed Secrets나 외부 시크릿 관리 도구를 사용하세요