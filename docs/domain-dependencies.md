# ドメイン依存関係図

```mermaid
graph TD
    blackjack_dealer["blackjack/dealer"]
    blackjack_game_flow["blackjack/game-flow"]
    blackjack_player["blackjack/player"]
    blackjack_game_setup["blackjack/game-setup"]
    blackjack_game_table["blackjack/game-table"]
    blackjack_action_buttons["blackjack/action-buttons"]
    blackjack_betting_input["blackjack/betting-input"]

    blackjack_dealer --> blackjack_game_flow
    blackjack_game_flow --> blackjack_player
    blackjack_game_flow --> blackjack_dealer
    blackjack_game_setup --> blackjack_game_flow
    blackjack_game_table --> blackjack_game_flow
    blackjack_game_table --> blackjack_action_buttons
    blackjack_game_table --> blackjack_betting_input
    blackjack_game_table --> blackjack_player
    blackjack_game_table --> blackjack_dealer
    blackjack_player --> blackjack_game_flow
```

## 凡例
- 実線の矢印: 正常な依存関係
- 点線の矢印: アーキテクチャルール違反
- 赤色のノード: 違反を含むドメイン

## 統計
- ドメイン数: 7
- 依存関係数: 10
- 違反数: 0
- 循環依存: 2

## 循環依存

1. blackjack/game-flow → blackjack/player → blackjack/game-flow
2. blackjack/dealer → blackjack/game-flow → blackjack/dealer
