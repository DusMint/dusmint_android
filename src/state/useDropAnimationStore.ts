import { create } from 'zustand';

export interface DropItemData {
  id: string;
  startX: number;
  startY: number;
  imageUrl?: string;
}

interface DropAnimationStore {
  drops: DropItemData[];
  triggerDrop: (params: { startX?: number; startY?: number; imageUrl?: string }) => void;
  removeDrop: (id: string) => void;
}

export const useDropAnimationStore = create<DropAnimationStore>((set) => ({
  drops: [],
  triggerDrop: ({ startX, startY, imageUrl }) => {
    const id = `drop_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    set((state) => ({
      // Keep up to 5 concurrent drops to preserve 60fps performance
      drops: [
        ...state.drops.slice(-4),
        {
          id,
          startX: typeof startX === 'number' && !isNaN(startX) ? startX : 200,
          startY: typeof startY === 'number' && !isNaN(startY) ? startY : 350,
          imageUrl,
        },
      ],
    }));
  },
  removeDrop: (id) => {
    set((state) => ({
      drops: state.drops.filter((d) => d.id !== id),
    }));
  },
}));
