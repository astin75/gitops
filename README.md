# GitOps Tutorial with ArgoCD

ArgoCD를 사용한 GitOps 튜토리얼입니다. Dev와 Prod 환경을 분리하여 방문자 카운터 애플리케이션을 배포합니다.

## 📁 프로젝트 구조

```
gitops/
├── argocd/                    # ArgoCD 설정
│   ├── install.yaml          # ArgoCD 네임스페이스
│   ├── argocd-server-nodeport.yaml  # NodePort 서비스
│   ├── app-of-apps.yaml      # App of Apps 패턴
│   └── applications/         # 개별 Application 정의
├── namespaces/               # 네임스페이스 정의
├── applications/             # 애플리케이션 매니페스트
│   ├── dev/                 # Dev 환경
│   │   ├── frontend/        
│   │   └── backend/         
│   └── prod/                # Prod 환경
│       ├── frontend/        
│       └── backend/         
└── README.md
```

## 🚀 빠른 시작

```bash
# 1. 저장소 클론
git clone https://github.com/astin75/gitops
cd gitops

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

1. 코드 변경 → Git Push
2. ArgoCD가 변경사항 감지
3. Dev는 자동 동기화, Prod는 수동 승인
4. Kubernetes에 배포

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

## 📚 참고 자료

- [ArgoCD 문서](https://argo-cd.readthedocs.io/)
- [GitOps 원칙](https://www.gitops.tech/)
- [프로젝트 저장소](https://github.com/astin75/gitops)