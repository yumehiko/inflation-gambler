import type { Meta, StoryObj } from "@storybook/react";
import { BlackjackGame } from "./blackjackGame.view";
import { useBlackjackGameHook } from "./blackjackGame.hook";
import { within } from "@storybook/test";
import { expect } from "@storybook/test";

const mockUseBlackjackGameHook = useBlackjackGameHook as ReturnType<typeof vi.fn>;

// フックのモック
vi.mock("./blackjackGame.hook");

// 関連コンポーネントのモック
vi.mock("../game-setup/gameSetup.view", () => ({
  GameSetup: ({ onStartGame }: { onStartGame: () => void }) => (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2>ブラックジャックへようこそ</h2>
      <button onClick={onStartGame} style={{ padding: "1rem 2rem", fontSize: "1.2rem" }}>
        ゲームを開始
      </button>
    </div>
  ),
}));

vi.mock("../game-controller/gameController.view", () => ({
  GameTableView: () => (
    <div style={{ backgroundColor: "#0d5d2e", padding: "2rem", borderRadius: "1rem", color: "white" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h3>ディーラー</h3>
        <div>♠A ♥10 (21)</div>
      </div>
      <div>
        <h3>プレイヤー</h3>
        <div>♣K ♦9 (19)</div>
      </div>
    </div>
  ),
}));

vi.mock("../betting-input/bettingInput.view", () => ({
  BettingInputView: ({ onBetConfirm }: { onBetConfirm: () => void }) => (
    <div style={{ backgroundColor: "white", padding: "1rem", borderRadius: "0.5rem" }}>
      <h3>ベット額を入力</h3>
      <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
        <button onClick={onBetConfirm}>ベット確定</button>
      </div>
    </div>
  ),
}));

vi.mock("../action-buttons/actionButtons.view", () => ({
  ActionButtonsView: ({ onAction }: { onAction: (action: { type: string }) => void }) => (
    <div style={{ display: "flex", gap: "1rem" }}>
      <button onClick={() => onAction({ type: "hit" })} style={{ padding: "0.5rem 1rem" }}>
        ヒット
      </button>
      <button onClick={() => onAction({ type: "stand" })} style={{ padding: "0.5rem 1rem" }}>
        スタンド
      </button>
      <button onClick={() => onAction({ type: "double" })} style={{ padding: "0.5rem 1rem" }}>
        ダブル
      </button>
    </div>
  ),
}));

vi.mock("../game-result/gameResult.view", () => ({
  GameResult: ({ onNextRound }: { onNextRound: () => void }) => (
    <div style={{ backgroundColor: "white", padding: "2rem", borderRadius: "1rem", textAlign: "center" }}>
      <h2>ゲーム結果</h2>
      <div style={{ margin: "1rem 0" }}>
        <p>ディーラー: 21 (ブラックジャック)</p>
        <p>プレイヤー: 19</p>
        <p style={{ fontWeight: "bold", color: "#d32f2f" }}>負け (-100コイン)</p>
      </div>
      <button onClick={onNextRound} style={{ padding: "0.5rem 1rem" }}>
        次のラウンドへ
      </button>
    </div>
  ),
}));

const meta = {
  title: "Blackjack/BlackjackGame",
  component: BlackjackGame,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof BlackjackGame>;

export default meta;
type Story = StoryObj<typeof meta>;

// デフォルトのフック戻り値
const createMockHookReturn = (overrides: Partial<ReturnType<typeof useBlackjackGameHook>> = {}) => ({
  isGameStarted: false,
  phase: "waiting" as const,
  errorMessage: undefined,
  isLoading: false,
  isPlayerActionRequired: false,
  betAmount: 0,
  handleGameStart: vi.fn(),
  handleBetChange: vi.fn(),
  handleBetConfirm: vi.fn(),
  handlePlayerAction: vi.fn(),
  handleNextRound: vi.fn(),
  handleGameReset: vi.fn(),
  gameState: {
    phase: "waiting" as const,
    participants: [{
      id: "player1",
      name: "プレイヤー1",
      balance: { value: 1000 },
      bet: null,
      hand: { cards: [], value: 0, isBust: false, isBlackjack: false },
      brain: { type: "human" as const, makeDecision: vi.fn() },

      status: "active" as const,
    }],
    dealer: { hand: { cards: [], value: 0, isBust: false, isBlackjack: false }, isBlackjack: false, score: 0, isBust: false },
    deck: { cards: [] },
    currentTurnIndex: 0,
    roundNumber: 1,
    history: [],
  },
  currentPlayer: {
    id: "player1",
    name: "プレイヤー1",
    balance: { value: 1000 },
    bet: null,
    hand: { cards: [], value: 0, isBust: false, isBlackjack: false },
    brain: { type: "human" as const, makeDecision: vi.fn() },
    status: "active" as const,
  },
  dealer: { hand: { cards: [], value: 0, isBust: false, isBlackjack: false }, isBlackjack: false, score: 0, isBust: false },
  ...overrides,
});

export const GameSetup: Story = {
  beforeEach: () => {
    mockUseBlackjackGameHook.mockReturnValue(createMockHookReturn());
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    const startButton = await canvas.findByText("ゲームを開始");
    expect(startButton).toBeInTheDocument();
  },
};

export const WaitingPhase: Story = {
  beforeEach: () => {
    mockUseBlackjackGameHook.mockReturnValue(createMockHookReturn({
      isGameStarted: true,
      phase: "waiting",
    }));
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    expect(await canvas.findByText("待機中")).toBeInTheDocument();
    expect(await canvas.findByText("新しいラウンドを開始")).toBeInTheDocument();
  },
};

export const BettingPhase: Story = {
  beforeEach: () => {
    mockUseBlackjackGameHook.mockReturnValue(createMockHookReturn({
      isGameStarted: true,
      phase: "betting",
    }));
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    expect(await canvas.findByText("ベッティング")).toBeInTheDocument();
    expect(await canvas.findByText("ベット額を入力")).toBeInTheDocument();
  },
};

export const DealingPhase: Story = {
  beforeEach: () => {
    mockUseBlackjackGameHook.mockReturnValue(createMockHookReturn({
      isGameStarted: true,
      phase: "dealing",
    }));
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    expect(await canvas.findByText("カード配布中")).toBeInTheDocument();
    expect(await canvas.findByText("ディーラー")).toBeInTheDocument();
  },
};

export const PlayingPhase: Story = {
  beforeEach: () => {
    mockUseBlackjackGameHook.mockReturnValue(createMockHookReturn({
      isGameStarted: true,
      phase: "playing",
      isPlayerActionRequired: true,
      currentPlayer: {
        id: "player1",
        name: "プレイヤー1",
        balance: { value: 1000 },
        bet: { value: 100 },
        hand: { cards: [], value: 0, isBust: false, isBlackjack: false },
        brain: { type: "human" as const, makeDecision: vi.fn() },
  
        status: "active" as const,
      },
    }));
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    expect(await canvas.findByText("プレイ中")).toBeInTheDocument();
    expect(await canvas.findByText("ヒット")).toBeInTheDocument();
    expect(await canvas.findByText("スタンド")).toBeInTheDocument();
  },
};

export const DealerTurn: Story = {
  beforeEach: () => {
    mockUseBlackjackGameHook.mockReturnValue(createMockHookReturn({
      isGameStarted: true,
      phase: "dealer-turn",
    }));
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    expect(await canvas.findByText("ディーラーターン")).toBeInTheDocument();
    expect(await canvas.findByText("ディーラー")).toBeInTheDocument();
  },
};

export const SettlementPhase: Story = {
  beforeEach: () => {
    mockUseBlackjackGameHook.mockReturnValue(createMockHookReturn({
      isGameStarted: true,
      phase: "settlement",
    }));
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    expect(await canvas.findByText("精算")).toBeInTheDocument();
    expect(await canvas.findByText("ゲーム結果")).toBeInTheDocument();
    expect(await canvas.findByText("次のラウンドへ")).toBeInTheDocument();
  },
};

export const WithError: Story = {
  beforeEach: () => {
    mockUseBlackjackGameHook.mockReturnValue(createMockHookReturn({
      isGameStarted: true,
      phase: "playing",
      errorMessage: "無効なアクションです。もう一度お試しください。",
    }));
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    expect(await canvas.findByText("無効なアクションです。もう一度お試しください。")).toBeInTheDocument();
  },
};

export const Loading: Story = {
  beforeEach: () => {
    mockUseBlackjackGameHook.mockReturnValue(createMockHookReturn({
      isGameStarted: true,
      phase: "playing",
      isLoading: true,
    }));
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    
    // ローディングオーバーレイの存在を確認
    const container = canvas.getByText("ブラックジャック").closest("div");
    const loadingElements = container?.querySelectorAll("div");
    const hasLoadingOverlay = Array.from(loadingElements || []).some(
      (el) => (el as HTMLElement).style.position === "fixed" || (el as HTMLElement).className.includes("loading")
    );
    expect(hasLoadingOverlay).toBe(true);
  },
};