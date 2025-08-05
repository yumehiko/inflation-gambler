import { useDealerStore } from './dealer.store';

// DealerStoreの初期化（アプリ起動時に一度だけ実行）
export const initializeDealerStore = () => {
  const store = useDealerStore.getState();
  store.startListeningToEvents();
};

// クリーンアップ（アプリ終了時）
export const cleanupDealerStore = () => {
  const store = useDealerStore.getState();
  store.stopListeningToEvents();
};