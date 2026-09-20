# BLUESTERTH Racing – インフラ構成メモ

## ブランチ戦略
| ブランチ | 用途 |
|----------|------|
| `main`   | 開発・ソースコード |
| `deploy` | k8sマニフェスト（ArgoCD監視対象）|

`deploy` ブランチは GitHub Actions が **force push で上書き**（amend相当）するため、コミット数は常に1件。

## ArgoCD 設定
```yaml
source:
  repoURL: https://github.com/YOUR_ORG/bluestarth.git
  targetRevision: deploy   # ← deploy ブランチを監視
  path: k8s
```

## 初回セットアップ手順

```bash
# 1. Secret 作成
kubectl create secret generic bluestarth-secret -n bluestarth \
  --from-literal=jwt-secret=$(openssl rand -hex 32) \
  --from-literal=discord-client-id=YOUR_ID \
  --from-literal=discord-client-secret=YOUR_SECRET \
  --from-literal=discord-admin-ids=YOUR_DISCORD_USER_ID

# 2. ArgoCD Application 登録
kubectl apply -f k8s/argocd-app.yaml

# 3. GitHub Secrets 設定
# GITHUB_TOKEN は自動付与
```

## Discord OAuth 設定
- Redirect URI: `https://bluestarth.reeldev.jp/manage/callback`
- Scopes: `identify`

## ディレクトリ構成
```
bluestarth/
├── frontend/          # Next.js 14 (App Router)
├── backend/           # Express + SQLite
├── k8s/               # Kubernetes manifests
├── .github/workflows/ # CI/CD
└── docker-compose.yml # ローカル開発
```

## 管理画面
`https://bluestarth.reeldev.jp/manage`（Discord認証が必要）
