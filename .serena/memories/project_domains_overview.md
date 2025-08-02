# Inflation Gambler ドメイン概要

## Core Domain (src/domains/core/)
- **user**: ユーザー情報と状態管理
- **coin**: ゲーム内通貨
- **card**: トランプカード
- **deck**: トランプカードのデッキ

## Blackjack Domain (src/domains/blackjack/)
- **hand**: プレイヤーの手札管理
- **dealer**: ディーラー専用ロジック
- **player**: プレイヤー管理（人間/CPU、手札、チップ、ベット）
- **rules**: ゲームルール設定
- **brain**: AI戦略（基本戦略、CPU思考）
- **action-buttons**: 人間用UI, ヒット/スタンド等のアクション
- **betting-input**: 人間用UI, ベット金額入力