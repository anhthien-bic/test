import { StateCreator, StoreApi } from 'zustand'

export interface LoadingOverlaySlice {
    isLoadingOverlayVisible: boolean
    setIsLoadingOverlayVisible: (isLoadingOverlayVisible: boolean) => void
}

const createLoadingOverlaySlice:
    | StateCreator<LoadingOverlaySlice>
    | StoreApi<LoadingOverlaySlice> = (set) => ({
    isLoadingOverlayVisible: false,
    setIsLoadingOverlayVisible: (isLoadingOverlayVisible: boolean) =>
        set(() => ({ isLoadingOverlayVisible })),
})

export default createLoadingOverlaySlice as (
    set: StoreApi<LoadingOverlaySlice>['setState'],
    get: StoreApi<LoadingOverlaySlice>['getState'],
    api: StoreApi<LoadingOverlaySlice>
) => LoadingOverlaySlice
