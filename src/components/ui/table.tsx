'use client';

import React, { ReactNode } from 'react';
import { Button } from './button';
import { Pagination } from './pagination';
import { LoadingDots } from '../LoadingDots';
import { ScrollArea, ScrollBar } from './scroll-area';

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  title?: string;
  description?: string;
  actions?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  }[];
  rowActions?: (item: T) => {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'ghost' | 'link';
    disabled?: boolean;
  }[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
  };
  loading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  title,
  description,
  actions,
  rowActions,
  pagination,
  loading = false,
  emptyMessage = 'No data available',
}: DataTableProps<T>) {
  return (
    <div>
      {/* Header */}
      {(title || description || actions) && (
        <div className="block sm:flex justify-between items-center mb-6">
          <div>
            {title && <h1 className="text-3xl font-bold">{title}</h1>}
            {description && <p className="text-gray-600 mt-1">{description}</p>}
          </div>
          {actions && actions.length > 0 && (
            <div className="flex gap-2">
              {actions.map((action, index) => (
                <Button
                  className="mt-3 sm:mt-0"
                  key={index}
                  onClick={action.onClick}
                  variant={action.variant || 'default'}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <ScrollArea className="w-full">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                        column.className || ''
                      }`}
                    >
                      {column.label}
                    </th>
                  ))}
                  {rowActions && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td
                      colSpan={columns.length + (rowActions ? 1 : 0)}
                      className="px-6 text-gray-500"
                    >
                      <div
                        className="w-full flex items-center justify-center"
                        style={{ minHeight: 200 }}
                      >
                        <LoadingDots />
                      </div>
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length + (rowActions ? 1 : 0)}
                      className="px-6 text-gray-500"
                    >
                      <div
                        className="w-full flex items-center justify-center"
                        style={{ minHeight: 200 }}
                      >
                        {emptyMessage}
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.map((item) => (
                    <tr key={keyExtractor(item)}>
                      {columns.map((column) => (
                        <td key={column.key} className={`px-6 py-4 ${column.className || ''}`}>
                          {column.render
                            ? column.render(item)
                            : String((item as Record<string, unknown>)[column.key] ?? '')}
                        </td>
                      ))}
                      {rowActions && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            {rowActions(item).map((action, index) => (
                              <Button
                                key={index}
                                onClick={action.onClick}
                                variant={action.variant || 'link'}
                                size="sm"
                                disabled={action.disabled}
                              >
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Pagination */}
        {pagination && data.length > 0 && (
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            pageSize={pagination.pageSize}
            totalItems={pagination.totalItems}
            onPageChange={pagination.onPageChange}
            onPageSizeChange={pagination.onPageSizeChange}
          />
        )}
      </div>
    </div>
  );
}
