import { usePlayerStore } from './player.store';

// PlayerStoreの初期化（アプリ起動時に一度だけ実行）
export const initializePlayerStore = () => {
  const store = usePlayerStore.getState();
  store.startListeningToEvents();
};

// クリーンアップ（アプリ終了時）
export const cleanupPlayerStore = () => {
  const store = usePlayerStore.getState();
  store.stopListeningToEvents();
};