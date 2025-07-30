# Inflation Gambler

馴染み深いギャンブルゲームをプレイしてコインを稼ぎ、能力強化によってさらに多くのコインを獲得していくインフレーションゲームです。

## ゲーム概要

- **基本ゲーム**: ブラックジャックなどのカジノゲームでコインを増やす
- **能力強化**: 獲得したコインでゲームルールに関わる能力を強化
  - 配当金額の増加
  - 特殊効果カードの追加
  - その他の有利な効果
- **インフレーション**: より多くのコインを得て、より強力な能力を解放し、さらに多くのコインを獲得する無限のサイクル

## 技術スタック

- React + TypeScript
- Vite
- Zustand (状態管理)
- CSS Modules
- Vitest + React Testing Library
- Storybook

## 開発環境のセットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# Storybookの起動
npm run storybook
```

## 開発コマンド

```bash
# テストの実行
npm run test

# 型チェック
npm run typecheck

# リント
npm run lint

# ビルド
npm run build
```

## ディレクトリ構成

```
src/
├── domains/        # ドメイン別モジュール
├── shared/         # 共通コンポーネント・ユーティリティ
└── App.tsx         # アプリケーションエントリーポイント
```