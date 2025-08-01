# Inflation Gambler 開発コマンド

## 開発時の基本コマンド

### 開発サーバー起動
```bash
npm run dev
```
Viteの開発サーバーを起動します。ホットリロード機能付き。

### Storybook起動
```bash
npm run storybook
```
ポート6006でStorybookを起動します。UIコンポーネントの開発・テストに使用。

## テスト・品質チェックコマンド

### テスト実行
```bash
npm run test         # 1回実行
npm run test:watch   # ウォッチモード
```
Vitestを使用したユニットテスト・統合テストの実行。

### 型チェック
```bash
npm run typecheck
```
TypeScriptの型エラーをチェック（コンパイルせずに確認）。

### リント
```bash
npm run lint
```
ESLintによるコード品質チェック。最大警告数は0に設定。

## ビルド・プレビュー

### プロダクションビルド
```bash
npm run build
```
型チェックを行った後、Viteでプロダクションビルドを作成。

### ビルドプレビュー
```bash
npm run preview
```
ビルドしたアプリケーションをローカルでプレビュー。

### Storybookビルド
```bash
npm run build-storybook
```
Storybookの静的ビルドを作成。

## Git関連コマンド（Darwin/macOS）

### 基本的なGitコマンド
```bash
git status          # 現在の状態確認
git diff            # 変更内容確認
git add .           # 全ファイルをステージング
git commit -m "メッセージ"  # コミット
git push            # リモートにプッシュ
git pull            # リモートから取得
```

### macOS固有のコマンド
```bash
ls -la              # ファイル一覧（隠しファイル含む）
find . -name "*.ts" # TypeScriptファイル検索
grep -r "pattern" . # パターン検索
```

## 依存関係管理
```bash
npm install         # 依存関係インストール
npm update          # 依存関係更新
```