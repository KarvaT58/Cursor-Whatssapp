'use client'

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Search,
  Filter,
  SortAsc,
  SortDesc,
  MoreHorizontal,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useVirtualScrolling } from '@/hooks/use-optimized-pagination'
import { useOptimizedDebounce } from '@/hooks/use-optimized-debounce'

interface OptimizedListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  keyExtractor: (item: T) => string
  searchFields?: (keyof T)[]
  filterFields?: (keyof T)[]
  sortFields?: (keyof T)[]
  itemHeight?: number
  containerHeight?: number
  enableVirtualization?: boolean
  enableSearch?: boolean
  enableFilter?: boolean
  enableSort?: boolean
  enablePagination?: boolean
  pageSize?: number
  className?: string
  emptyMessage?: string
  loading?: boolean
  onLoadMore?: () => void
  hasMore?: boolean
}

export function OptimizedList<T>({
  items,
  renderItem,
  keyExtractor,
  searchFields = [],
  filterFields = [],
  sortFields = [],
  itemHeight = 50,
  containerHeight = 400,
  enableVirtualization = true,
  enableSearch = true,
  enableFilter = true,
  enableSort = true,
  enablePagination = false,
  pageSize = 20,
  className,
  emptyMessage = 'No items found',
  loading = false,
  onLoadMore,
  hasMore = false,
}: OptimizedListProps<T>) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<keyof T | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [filters, setFilters] = useState<Record<string, unknown>>({})
  const [currentPage, setCurrentPage] = useState(1)

  // Debounced search
  const debouncedSearch = useOptimizedDebounce(
    (term: unknown) => setSearchTerm(term as string),
    { delay: 300, maxWait: 1000 }
  )

  // Filter and search items
  const filteredItems = useMemo(() => {
    let filtered = items

    // Apply search
    if (searchTerm && searchFields.length > 0) {
      filtered = filtered.filter((item) =>
        searchFields.some((field) => {
          const value = item[field]
          return (
            value &&
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
          )
        })
      )
    }

    // Apply filters
    if (Object.keys(filters).length > 0) {
      filtered = filtered.filter((item) =>
        Object.entries(filters).every(([field, value]) => {
          if (!value) return true
          const itemValue = item[field as keyof T]
          return (
            itemValue &&
            itemValue
              .toString()
              .toLowerCase()
              .includes((value as string).toLowerCase())
          )
        })
      )
    }

    // Apply sorting
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortField]
        const bValue = b[sortField]

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [items, searchTerm, searchFields, filters, sortField, sortDirection])

  // Pagination
  const paginatedItems = useMemo(() => {
    if (!enablePagination) return filteredItems

    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredItems.slice(startIndex, endIndex)
  }, [filteredItems, enablePagination, currentPage, pageSize])

  // Virtual scrolling
  const { virtualItems, totalHeight, offsetY, handleScroll } =
    useVirtualScrolling(
      enableVirtualization ? paginatedItems : filteredItems,
      itemHeight,
      containerHeight
    )

  // Handle search
  const handleSearch = useCallback(
    (value: string) => {
      debouncedSearch(value)
    },
    [debouncedSearch]
  )

  // Handle sort
  const handleSort = useCallback(
    (field: keyof T) => {
      if (sortField === field) {
        setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
      } else {
        setSortField(field)
        setSortDirection('asc')
      }
    },
    [sortField]
  )

  // Handle filter
  const handleFilter = useCallback((field: keyof T, value: unknown) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value || undefined,
    }))
  }, [])

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (onLoadMore && hasMore && !loading) {
      onLoadMore()
    }
  }, [onLoadMore, hasMore, loading])

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filters, sortField, sortDirection])

  const totalPages = Math.ceil(filteredItems.length / pageSize)

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search and Filters */}
      {(enableSearch || enableFilter || enableSort) && (
        <div className="space-y-3">
          {/* Search */}
          {enableSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          {/* Filters and Sort */}
          <div className="flex items-center gap-2 flex-wrap">
            {enableFilter && filterFields.length > 0 && (
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                {filterFields.map((field) => (
                  <Input
                    key={String(field)}
                    placeholder={`Filter by ${String(field)}`}
                    value={(filters[String(field)] as string) || ''}
                    onChange={(e) => handleFilter(field, e.target.value)}
                    className="w-32"
                  />
                ))}
              </div>
            )}

            {enableSort && sortFields.length > 0 && (
              <div className="flex items-center gap-2">
                {sortFields.map((field) => (
                  <Button
                    key={String(field)}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSort(field)}
                    className="flex items-center gap-1"
                  >
                    {String(field)}
                    {sortField === field &&
                      (sortDirection === 'asc' ? (
                        <SortAsc className="h-3 w-3" />
                      ) : (
                        <SortDesc className="h-3 w-3" />
                      ))}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results Info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {filteredItems.length} of {items.length} items
        </span>
        {enablePagination && (
          <span>
            Page {currentPage} of {totalPages}
          </span>
        )}
      </div>

      {/* List Container */}
      <div className="border rounded-lg">
        {loading && filteredItems.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex items-center justify-center p-8 text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <ScrollArea
            className="w-full"
            style={{ height: enableVirtualization ? containerHeight : 'auto' }}
            onScroll={enableVirtualization ? handleScroll : undefined}
          >
            {enableVirtualization ? (
              <div style={{ height: totalHeight, position: 'relative' }}>
                <div style={{ transform: `translateY(${offsetY}px)` }}>
                  {virtualItems.map(({ item, index, top }) => (
                    <div
                      key={keyExtractor(item)}
                      style={{
                        position: 'absolute',
                        top,
                        left: 0,
                        right: 0,
                        height: itemHeight,
                      }}
                    >
                      {renderItem(item, index)}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-0">
                {paginatedItems.map((item, index) => (
                  <div key={keyExtractor(item)}>
                    {renderItem(item, index)}
                    {index < paginatedItems.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        )}

        {/* Load More */}
        {hasMore && (
          <div className="p-4 border-t">
            <Button
              variant="outline"
              onClick={handleLoadMore}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading...
                </>
              ) : (
                'Load More'
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {enablePagination && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              )
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
