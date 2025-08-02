# Inflation Gambler ドメイン概要

## Core Domain (src/domains/core/)
- **card**: トランプカードの表示
- **user**: ユーザー情報と状態管理
- **coin**: ゲーム内通貨
- **deck**: カードデッキの操作

## Blackjack Domain (src/domains/blackjack/)
- **hand**: プレイヤーの手札管理
- **dealer**: ディーラー専用ロジック
- **player**: プレイヤー管理（人間/CPU、手札、チップ、ベット）
- **rules**: ゲームルール設定
- **brain**: AI戦略（基本戦略、CPU思考）
- **action-buttons**: ヒット/スタンド等のアクション
- **betting-input**: ベット金額入力