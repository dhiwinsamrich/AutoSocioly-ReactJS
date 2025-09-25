import { create } from 'zustand';

interface PageTransitionState {
  isTransitioning: boolean;
  isLoading: boolean;
  startTransition: () => void;
  endTransition: () => void;
  startLoading: () => void;
  endLoading: () => void;
}

export const usePageTransition = create<PageTransitionState>((set) => ({
  isTransitioning: false,
  isLoading: false,
  startTransition: () => set({ isTransitioning: true }),
  endTransition: () => set({ isTransitioning: false }),
  startLoading: () => set({ isLoading: true }),
  endLoading: () => set({ isLoading: false }),
}));