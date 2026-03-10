import { create } from 'zustand'

interface LoadingStore {
    isLoading: boolean
    isFiltering: boolean
    message: string
    showLoading: (message?: string) => void
    hideLoading: () => void
    setIsFiltering: (filtering: boolean) => void
}

export const useLoadingStore = create<LoadingStore>((set) => ({
    isLoading: false,
    isFiltering: false,
    message: 'Cargando Magia...',
    showLoading: (message = 'Cargando Magia...') => set({ isLoading: true, message }),
    hideLoading: () => set({ isLoading: false }),
    setIsFiltering: (filtering: boolean) => set({ isFiltering: filtering }),
}))
