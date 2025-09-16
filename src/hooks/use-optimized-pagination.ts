'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'

interface PaginationOptions {
  pageSize: number
  totalItems: number
  initialPage?: number
  maxVisiblePages?: number
  enableVirtualization?: boolean
  virtualItemHeight?: number
  containerHeight?: number
}

interface PaginationState {
  currentPage: number
  totalPages: number
  pageSize: number
  totalItems: number
  startIndex: number
  endIndex: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  visiblePages: number[]
  isVirtualized: boolean
  virtualStartIndex: number
  virtualEndIndex: number
  virtualOffset: number
}

interface PaginationActions {
  goToPage: (page: number) => void
  nextPage: () => void
  previousPage: () => void
  firstPage: () => void
  lastPage: () => void
  setPageSize: (size: number) => void
  reset: () => void
}

export function useOptimizedPagination(
  options: PaginationOptions
): [PaginationState, PaginationActions] {
  const {
    pageSize: initialPageSize,
    totalItems,
    initialPage = 1,
    maxVisiblePages = 5,
    enableVirtualization = false,
    virtualItemHeight = 50,
    containerHeight = 400,
  } = options

  const [currentPage, setCurrentPage] = useState(initialPage)
  const [pageSize, setPageSize] = useState(initialPageSize)

  // Calculate pagination state
  const paginationState = useMemo((): PaginationState => {
    const totalPages = Math.ceil(totalItems / pageSize)
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = Math.min(startIndex + pageSize, totalItems)
    const hasNextPage = currentPage < totalPages
    const hasPreviousPage = currentPage > 1

    // Calculate visible pages
    const visiblePages: number[] = []
    const halfVisible = Math.floor(maxVisiblePages / 2)
    let startPage = Math.max(1, currentPage - halfVisible)
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      visiblePages.push(i)
    }

    // Virtualization calculations
    const isVirtualized = enableVirtualization && totalItems > pageSize
    let virtualStartIndex = 0
    let virtualEndIndex = totalItems
    let virtualOffset = 0

    if (isVirtualized) {
      const visibleItems = Math.ceil(containerHeight / virtualItemHeight)
      virtualStartIndex = Math.max(0, startIndex - Math.floor(visibleItems / 2))
      virtualEndIndex = Math.min(
        totalItems,
        virtualStartIndex + visibleItems * 2
      )
      virtualOffset = virtualStartIndex * virtualItemHeight
    }

    return {
      currentPage,
      totalPages,
      pageSize,
      totalItems,
      startIndex,
      endIndex,
      hasNextPage,
      hasPreviousPage,
      visiblePages,
      isVirtualized,
      virtualStartIndex,
      virtualEndIndex,
      virtualOffset,
    }
  }, [
    currentPage,
    pageSize,
    totalItems,
    maxVisiblePages,
    enableVirtualization,
    virtualItemHeight,
    containerHeight,
  ])

  // Pagination actions
  const goToPage = useCallback(
    (page: number) => {
      const totalPages = Math.ceil(totalItems / pageSize)
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page)
      }
    },
    [totalItems, pageSize]
  )

  const nextPage = useCallback(() => {
    const totalPages = Math.ceil(totalItems / pageSize)
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1)
    }
  }, [currentPage, totalItems, pageSize])

  const previousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1)
    }
  }, [currentPage])

  const firstPage = useCallback(() => {
    setCurrentPage(1)
  }, [])

  const lastPage = useCallback(() => {
    const totalPages = Math.ceil(totalItems / pageSize)
    setCurrentPage(totalPages)
  }, [totalItems, pageSize])

  const setPageSizeAction = useCallback((size: number) => {
    setPageSize(size)
    setCurrentPage(1) // Reset to first page when changing page size
  }, [])

  const reset = useCallback(() => {
    setCurrentPage(initialPage)
    setPageSize(initialPageSize)
  }, [initialPage, initialPageSize])

  const actions: PaginationActions = {
    goToPage,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    setPageSize: setPageSizeAction,
    reset,
  }

  // Reset to first page when total items change
  useEffect(() => {
    if (currentPage > Math.ceil(totalItems / pageSize)) {
      setCurrentPage(1)
    }
  }, [totalItems, pageSize, currentPage])

  return [paginationState, actions]
}

// Hook for virtual scrolling
export function useVirtualScrolling<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0)

  const virtualItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight)
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight)
    )

    const start = Math.max(0, startIndex - overscan)
    const end = Math.min(items.length - 1, endIndex + overscan)

    return items.slice(start, end + 1).map((item, index) => ({
      item,
      index: start + index,
      top: (start + index) * itemHeight,
    }))
  }, [items, itemHeight, containerHeight, scrollTop, overscan])

  const totalHeight = items.length * itemHeight
  const offsetY = Math.max(0, scrollTop - overscan * itemHeight)

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop)
  }, [])

  return {
    virtualItems,
    totalHeight,
    offsetY,
    handleScroll,
  }
}

// Hook for infinite scrolling
export function useInfiniteScroll<T>(
  fetchMore: () => Promise<T[]>,
  hasMore: boolean,
  threshold: number = 100
) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    setError(null)

    try {
      await fetchMore()
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to load more items')
      )
    } finally {
      setIsLoading(false)
    }
  }, [fetchMore, hasMore, isLoading])

  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = event.currentTarget

      if (scrollHeight - scrollTop - clientHeight < threshold) {
        loadMore()
      }
    },
    [loadMore, threshold]
  )

  return {
    isLoading,
    error,
    loadMore,
    handleScroll,
  }
}
