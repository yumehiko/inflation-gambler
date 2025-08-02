import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { BettingInputView } from "./bettingInput.view";

describe("BettingInputView", () => {
  const defaultProps = {
    participantId: "player1",
    balance: 1000,
    minBet: 10,
    maxBet: 500,
    currentBet: 0,
    onBetChange: vi.fn(),
    onBetConfirm: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render initial state correctly", () => {
    render(<BettingInputView {...defaultProps} />);
    
    expect(screen.getByLabelText("Current bet amount")).toBeInTheDocument();
    expect(screen.getByText("$0")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirm bet" })).toBeInTheDocument();
  });

  it("should display current bet amount", () => {
    render(<BettingInputView {...defaultProps} currentBet={100} />);
    
    const betDisplay = screen.getByLabelText("Current bet amount");
    expect(betDisplay).toHaveTextContent("$100");
  });

  it("should handle chip button clicks", async () => {
    const user = userEvent.setup();
    render(<BettingInputView {...defaultProps} />);
    
    const chip10Button = screen.getByRole("button", { name: "Add $10 chip" });
    await user.click(chip10Button);
    
    expect(defaultProps.onBetChange).toHaveBeenCalledWith(10);
  });

  it("should handle multiple chip additions", async () => {
    const user = userEvent.setup();
    render(<BettingInputView {...defaultProps} currentBet={50} />);
    
    const chip25Button = screen.getByRole("button", { name: "Add $25 chip" });
    await user.click(chip25Button);
    
    expect(defaultProps.onBetChange).toHaveBeenCalledWith(75);
  });

  it("should handle quick bet buttons", async () => {
    const user = userEvent.setup();
    render(<BettingInputView {...defaultProps} />);
    
    const minButton = screen.getByRole("button", { name: "Set minimum bet" });
    await user.click(minButton);
    
    expect(defaultProps.onBetChange).toHaveBeenCalledWith(10);
    
    const maxButton = screen.getByRole("button", { name: "Set maximum bet" });
    await user.click(maxButton);
    
    expect(defaultProps.onBetChange).toHaveBeenCalledWith(500);
  });

  it("should handle 2x button", async () => {
    const user = userEvent.setup();
    render(<BettingInputView {...defaultProps} currentBet={50} />);
    
    const doubleButton = screen.getByRole("button", { name: "Double current bet" });
    await user.click(doubleButton);
    
    expect(defaultProps.onBetChange).toHaveBeenCalledWith(100);
  });

  it("should handle 1/2 button", async () => {
    const user = userEvent.setup();
    render(<BettingInputView {...defaultProps} currentBet={100} />);
    
    const halfButton = screen.getByRole("button", { name: "Half current bet" });
    await user.click(halfButton);
    
    expect(defaultProps.onBetChange).toHaveBeenCalledWith(50);
  });

  it("should handle clear button", async () => {
    const user = userEvent.setup();
    render(<BettingInputView {...defaultProps} currentBet={100} />);
    
    const clearButton = screen.getByRole("button", { name: "Clear bet" });
    await user.click(clearButton);
    
    expect(defaultProps.onBetChange).toHaveBeenCalledWith(0);
  });

  it("should not exceed maximum bet", async () => {
    const user = userEvent.setup();
    render(<BettingInputView {...defaultProps} currentBet={490} />);
    
    const chip10Button = screen.getByRole("button", { name: "Add $10 chip" });
    expect(chip10Button).not.toBeDisabled();
    await user.click(chip10Button);
    
    expect(defaultProps.onBetChange).toHaveBeenCalledWith(500);
  });

  it("should not exceed balance", async () => {
    const user = userEvent.setup();
    render(<BettingInputView {...defaultProps} balance={100} currentBet={95} />);
    
    const chip5Button = screen.getByRole("button", { name: "Add $5 chip" });
    expect(chip5Button).not.toBeDisabled();
    await user.click(chip5Button);
    
    expect(defaultProps.onBetChange).toHaveBeenCalledWith(100);
  });

  it("should disable chips that would exceed limits", () => {
    render(<BettingInputView {...defaultProps} balance={100} currentBet={95} />);
    
    const chip10Button = screen.getByRole("button", { name: "Add $10 chip" });
    const chip25Button = screen.getByRole("button", { name: "Add $25 chip" });
    
    expect(chip10Button).toBeDisabled();
    expect(chip25Button).toBeDisabled();
  });

  it("should handle bet confirmation", async () => {
    const user = userEvent.setup();
    render(<BettingInputView {...defaultProps} currentBet={100} />);
    
    const confirmButton = screen.getByRole("button", { name: "Confirm bet" });
    await user.click(confirmButton);
    
    expect(defaultProps.onBetConfirm).toHaveBeenCalled();
  });

  it("should disable confirm button when bet is 0", () => {
    render(<BettingInputView {...defaultProps} currentBet={0} />);
    
    const confirmButton = screen.getByRole("button", { name: "Confirm bet" });
    expect(confirmButton).toBeDisabled();
  });

  it("should disable confirm button when bet is below minimum", () => {
    render(<BettingInputView {...defaultProps} currentBet={5} />);
    
    const confirmButton = screen.getByRole("button", { name: "Confirm bet" });
    expect(confirmButton).toBeDisabled();
  });

  it("should disable all controls when disabled prop is true", () => {
    render(<BettingInputView {...defaultProps} currentBet={50} disabled />);
    
    const buttons = screen.getAllByRole("button");
    buttons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it("should handle Max button with balance constraint", async () => {
    const user = userEvent.setup();
    render(<BettingInputView {...defaultProps} balance={300} />);
    
    const maxButton = screen.getByRole("button", { name: "Set maximum bet" });
    await user.click(maxButton);
    
    expect(defaultProps.onBetChange).toHaveBeenCalledWith(300);
  });

  it("should round down half bet to nearest integer", async () => {
    const user = userEvent.setup();
    render(<BettingInputView {...defaultProps} currentBet={51} />);
    
    const halfButton = screen.getByRole("button", { name: "Half current bet" });
    await user.click(halfButton);
    
    expect(defaultProps.onBetChange).toHaveBeenCalledWith(25);
  });
});