'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { SearchInput } from '@/components/admin/search-input';
import { FilterSelect, FilterOption } from '@/components/admin/filter-select';
import { Pagination } from '@/components/admin/pagination';
import { EmptyState } from '@/components/admin/empty-state';
import { SearchX, Loader2 } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
  headClassName?: string;
}

export interface FilterConfig {
  key: string;
  placeholder?: string;
  options: FilterOption[];
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchKeys?: (keyof T)[];
  filters?: FilterConfig[];
  pageSize?: number;
  toolbar?: React.ReactNode;
  searchPlaceholder?: string;
  getRowId: (row: T) => string;
  emptyTitle?: string;
  emptyDescription?: string;
  loading?: boolean;

  // Server-side props
  serverSide?: boolean;
  onServerParamsChange?: (params: { search: string; filters: Record<string, string>; page: number }) => void;
  serverTotalItems?: number;
}

export function DataTable<T>({
  data,
  columns,
  searchKeys,
  filters = [],
  pageSize = 8,
  toolbar,
  searchPlaceholder = 'Search…',
  getRowId,
  emptyTitle = 'No results found',
  emptyDescription = 'Try adjusting your search or filters.',
  loading = false,
  serverSide = false,
  onServerParamsChange,
  serverTotalItems,
}: DataTableProps<T>) {
  const [query, setQuery] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);

  const callbackRef = useRef(onServerParamsChange);
  useEffect(() => {
    callbackRef.current = onServerParamsChange;
  }, [onServerParamsChange]);

  // Debounce notification to parent on query/filter/page change
  useEffect(() => {
    if (serverSide && callbackRef.current) {
      const handler = setTimeout(() => {
        callbackRef.current?.({ search: query, filters: filterValues, page });
      }, 300);
      return () => clearTimeout(handler);
    }
  }, [query, filterValues, page, serverSide]);

  const filtered = useMemo(() => {
    if (serverSide) return data;

    return data.filter((row) => {
      const matchesQuery =
        query.trim() === '' ||
        !searchKeys ||
        searchKeys.some((k) =>
          String(row[k] ?? '').toLowerCase().includes(query.toLowerCase())
        );
      const matchesFilters = filters.every((f) => {
        const v = filterValues[f.key];
        return !v || v === 'all' || String(row[f.key as keyof T]) === v;
      });
      return matchesQuery && matchesFilters;
    });
  }, [data, query, filterValues, searchKeys, filters, serverSide]);

  // Compute pagination details
  const totalItems = serverSide ? (serverTotalItems ?? data.length) : filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);
  
  // In serverSide mode, pagination is handled by the server (so we render the full dataset passed)
  const paged = serverSide ? data : filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <SearchInput
          value={query}
          onChange={(v) => {
            setQuery(v);
            setPage(1);
          }}
          placeholder={searchPlaceholder}
          className="sm:max-w-xs"
        />
        {filters.map((f) => (
          <FilterSelect
            key={f.key}
            value={filterValues[f.key] ?? 'all'}
            onChange={(v) => {
              setFilterValues((prev) => ({ ...prev, [f.key]: v }));
              setPage(1);
            }}
            options={[{ label: 'All', value: 'all' }, ...f.options]}
            placeholder={f.placeholder}
            className={f.width ?? 'w-[160px]'}
          />
        ))}
        {toolbar && <div className="sm:ml-auto">{toolbar}</div>}
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              {columns.map((c) => (
                <TableHead key={c.key} className={c.headClassName}>
                  {c.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-xs text-muted-foreground">Loading data...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : paged.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className="p-0">
                  <EmptyState icon={SearchX} title={emptyTitle} description={emptyDescription} className="border-0" />
                </TableCell>
              </TableRow>
            ) : (
              paged.map((row) => (
                <TableRow key={getRowId(row)}>
                  {columns.map((c) => (
                    <TableCell key={c.key} className={c.className}>
                      {c.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Pagination
        page={currentPage}
        totalPages={totalPages}
        onPage={setPage}
        total={totalItems}
        pageSize={pageSize}
      />
    </div>
  );
}
