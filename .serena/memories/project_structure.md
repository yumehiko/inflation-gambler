# Inflation Gambler プロジェクト構造

## ルートディレクトリ構成
```
inflation-gambler/
├── src/                    # ソースコード
├── public/                 # 静的ファイル
├── node_modules/          # 依存関係
├── .storybook/            # Storybook設定
├── package.json           # プロジェクト設定・スクリプト
├── tsconfig.json          # TypeScript設定
├── vite.config.ts         # Vite設定
├── README.md              # プロジェクト説明
└── CLAUDE.md              # AI開発ガイドライン
```

## src/ディレクトリ詳細

### エントリーポイント
- `main.tsx` - アプリケーションのエントリーポイント（React RouterとApp.tsxをレンダリング）
- `App.tsx` - メインアプリケーションコンポーネント
- `index.css` - グローバルスタイル

### domains/ - ドメイン別モジュール
現在実装されているドメイン：

#### core/ - コアドメイン
- **card/** - カード関連（型定義、ビュー、Storybook）
- **coin/** - コイン関連（型定義、ユーティリティ、テスト）
- **deck/** - デッキ関連（型定義、ユーティリティ、テスト）
- **player/** - プレイヤー関連（完全実装：store、hook、utils、tests）

#### blackjack/ - ブラックジャックゲーム
- **hand/** - 手札関連（完全実装：view、utils、stories、tests）
- **hand-holder/** - 手札ホルダー（utils、types、stories、tests）
- **dealer/** - ディーラー関連（完全実装：store、hook、utils、tests）

#### counter/ - カウンターサンプル
- 完全な実装例（view、store、hook、utils、tests、stories、CSS）

### shared/ - 共有コンポーネント
グローバルに使用される共有コンポーネントとユーティリティ

## ドメインモジュールの標準構成
各ドメインは以下のファイル構成を持つ：
1. `[domain].types.ts` - 型定義
2. `[domain].utils.ts` - 純粋関数
3. `[domain].utils.test.ts` - ユーティリティテスト
4. `[domain].view.tsx` - UIコンポーネント
5. `[domain].view.test.tsx` - UIテスト
6. `[domain].store.ts` - Zustand状態管理
7. `[domain].store.test.ts` - ストアテスト
8. `[domain].hook.ts` - カスタムフック
9. `[domain].hook.test.ts` - フックテスト
10. `[domain].module.css` - スタイル
11. `[domain].stories.tsx` - Storybook