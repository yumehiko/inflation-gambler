# Inflation Gambler コード規約とスタイル

## 重要なルール

### 常に守るべきこと
- テスト駆動開発（TDD）: 実装前にテストを書く
- UIコンポーネントにはStorybookテストを作成する
- コミット前に必ず実行: `npm run lint && npm run typecheck && npm run test`
- TypeScriptのstrictモードを使用する

## ディレクトリ構造
```
src/
├── domains/        # ドメイン別モジュール
│   └── [domain]/
│       ├── [domain].types.ts      # 型定義
│       ├── [domain].utils.ts      # 純粋関数
│       ├── [domain].utils.test.ts
│       ├── [domain].view.tsx      # UIコンポーネント
│       ├── [domain].view.test.tsx
│       ├── [domain].store.ts      # 状態とアクション（Zustand）
│       ├── [domain].store.test.ts
│       ├── [domain].hook.ts       # ViewとStoreを繋ぐカスタムフック
│       ├── [domain].hook.test.ts
│       ├── [domain].module.css    # CSS Modules
│       └── [domain].stories.tsx   # Storybook
├── shared/         # グローバル共有要素
└── App.tsx        # アプリケーションエントリーポイント
```

## 命名規則

### PascalCase
- type キーワードで定義される型名

### camelCase
- 変数名
- 関数名
- ファイル名

### CONSTANT_CASE
- 定数値

## ファイルサフィックスルール
- `.view.tsx` - ビューレイヤーコンポーネント（UIのみ、ビジネスロジック無し）
- `.hook.ts` - ストア管理状態とロジックオーケストレーションへのインターフェースとなるカスタムフック
- `.service.ts` - APIサービスと外部統合
- `.store.ts` - 状態コンテナ（例：Zustand）実際の状態と変更ロジックを定義
- `.type.ts` - 型定義
- `.utils.ts` - 純粋なユーティリティ関数（副作用なし）
- `.stories.tsx` - Storybookストーリー
- `.test.ts(x)` - テストファイル
- `.module.css` - CSS Modules

## テストファイル配置
- **共置**: テストファイル（`.test.ts`、`.test.tsx`）はテスト対象のコードと同じディレクトリに配置
- 例: `src/domains/counter/counter.view.test.tsx` は `src/domains/counter/counter.view.tsx` のテスト
- `tests/` ディレクトリは統合テストとテストユーティリティ専用