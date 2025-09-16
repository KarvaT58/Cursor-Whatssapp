'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

interface UseRealtimePaginationOptions {
  pageSize?: number
  maxPages?: number
  enableInfiniteScroll?: boolean
  debounceMs?: number
}

interface PaginationState {
  currentPage: number
  totalPages: number
  totalItems: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  isLoading: boolean
}

export function useRealtimePagination<T>(
  initialData: T[] = [],
  options: UseRealtimePaginationOptions = {}
) {
  const {
    pageSize = 20,
    maxPages = 10,
    enableInfiniteScroll = false,
    debounceMs = 300,
  } = options

  const [data, setData] = useState<T[]>(initialData)
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    totalPages: Math.ceil(initialData.length / pageSize),
    totalItems: initialData.length,
    hasNextPage: initialData.length > pageSize,
    hasPreviousPage: false,
    isLoading: false,
  })

  const debounceTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const lastUpdateRef = useRef<number>(0)

  // Update data with debouncing
  const updateData = useCallback(
    (newData: T[], totalCount?: number) => {
      const now = Date.now()
      lastUpdateRef.current = now

      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }

      debounceTimeoutRef.current = setTimeout(() => {
        if (lastUpdateRef.current === now) {
          setData(newData)

          const total = totalCount || newData.length
          const totalPages = Math.ceil(total / pageSize)

          setPagination((prev) => ({
            ...prev,
            totalPages,
            totalItems: total,
            hasNextPage: prev.currentPage < totalPages,
            hasPreviousPage: prev.currentPage > 1,
            isLoading: false,
          }))
        }
      }, debounceMs)
    },
    [pageSize, debounceMs]
  )

  // Add new item to the beginning (for real-time updates)
  const prependItem = useCallback(
    (item: T) => {
      setData((prev) => [item, ...prev])
      setPagination((prev) => ({
        ...prev,
        totalItems: prev.totalItems + 1,
        totalPages: Math.ceil((prev.totalItems + 1) / pageSize),
        hasNextPage:
          prev.currentPage < Math.ceil((prev.totalItems + 1) / pageSize),
      }))
    },
    [pageSize]
  )

  // Add new item to the end
  const appendItem = useCallback(
    (item: T) => {
      setData((prev) => [...prev, item])
      setPagination((prev) => ({
        ...prev,
        totalItems: prev.totalItems + 1,
        totalPages: Math.ceil((prev.totalItems + 1) / pageSize),
        hasNextPage:
          prev.currentPage < Math.ceil((prev.totalItems + 1) / pageSize),
      }))
    },
    [pageSize]
  )

  // Update existing item
  const updateItem = useCallback((item: T, findFn: (item: T) => boolean) => {
    setData((prev) =>
      prev.map((existingItem) => (findFn(existingItem) ? item : existingItem))
    )
  }, [])

  // Remove item
  const removeItem = useCallback(
    (findFn: (item: T) => boolean) => {
      setData((prev) => {
        const newData = prev.filter((item) => !findFn(item))
        const total = newData.length
        const totalPages = Math.ceil(total / pageSize)

        setPagination((prevPagination) => ({
          ...prevPagination,
          totalItems: total,
          totalPages,
          hasNextPage: prevPagination.currentPage < totalPages,
          hasPreviousPage: prevPagination.currentPage > 1,
        }))

        return newData
      })
    },
    [pageSize]
  )

  // Navigate to specific page
  const goToPage = useCallback(
    (page: number) => {
      if (page < 1 || page > pagination.totalPages) return

      setPagination((prev) => ({
        ...prev,
        currentPage: page,
        hasNextPage: page < prev.totalPages,
        hasPreviousPage: page > 1,
        isLoading: true,
      }))
    },
    [pagination.totalPages]
  )

  // Go to next page
  const nextPage = useCallback(() => {
    if (pagination.hasNextPage) {
      goToPage(pagination.currentPage + 1)
    }
  }, [pagination.hasNextPage, pagination.currentPage, goToPage])

  // Go to previous page
  const previousPage = useCallback(() => {
    if (pagination.hasPreviousPage) {
      goToPage(pagination.currentPage - 1)
    }
  }, [pagination.hasPreviousPage, pagination.currentPage, goToPage])

  // Load more (for infinite scroll)
  const loadMore = useCallback(() => {
    if (
      enableInfiniteScroll &&
      pagination.hasNextPage &&
      !pagination.isLoading
    ) {
      setPagination((prev) => ({ ...prev, isLoading: true }))
      // The parent component should handle loading more data
    }
  }, [enableInfiniteScroll, pagination.hasNextPage, pagination.isLoading])

  // Get current page data
  const getCurrentPageData = useCallback(() => {
    const startIndex = (pagination.currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return data.slice(startIndex, endIndex)
  }, [data, pagination.currentPage, pageSize])

  // Reset pagination
  const reset = useCallback(() => {
    setData([])
    setPagination({
      currentPage: 1,
      totalPages: 0,
      totalItems: 0,
      hasNextPage: false,
      hasPreviousPage: false,
      isLoading: false,
    })
  }, [])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  return {
    data,
    pagination,
    updateData,
    prependItem,
    appendItem,
    updateItem,
    removeItem,
    goToPage,
    nextPage,
    previousPage,
    loadMore,
    getCurrentPageData,
    reset,
  }
}
