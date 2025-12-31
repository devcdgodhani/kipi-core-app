import React, { type ReactNode } from 'react';
import { Loader2, Sliders, ChevronLeft, ChevronRight } from 'lucide-react';

export interface Column<T> {
    header: string;
    key?: string;
    accessorKey?: keyof T;
    render?: (item: T) => ReactNode;
    align?: 'left' | 'center' | 'right';
    className?: string; // For explicit width or other utility classes
}

export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

interface TableProps<T> {
    data: T[];
    columns: Column<T>[];
    isLoading?: boolean;
    keyExtractor: (item: T) => string;
    pagination?: PaginationProps;
    emptyMessage?: string;
    onRowClick?: (item: T) => void;
}

export function Table<T>({
    data,
    columns,
    isLoading = false,
    keyExtractor,
    pagination,
    emptyMessage = "No items found",
    onRowClick
}: TableProps<T>) {

    return (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden relative transition-all hover:shadow-2xl hover:shadow-gray-200/60">
            {isLoading && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 size={40} className="text-primary animate-spin" />
                        <p className="text-sm font-bold text-primary uppercase tracking-widest">Loading...</p>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/50">
                            {columns.map((col, index) => (
                                <th
                                    key={index}
                                    className={`py-6 px-6 text-xs font-black text-gray-400 uppercase tracking-widest ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'} ${col.className || ''}`}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {data.length > 0 ? (
                            data.map((item) => (
                                <tr
                                    key={keyExtractor(item)}
                                    className={`group hover:bg-gray-50/50 transition-colors ${onRowClick ? 'cursor-pointer active:bg-gray-100' : ''}`}
                                    onClick={onRowClick ? () => onRowClick(item) : undefined}
                                >
                                    {columns.map((col, index) => (
                                        <td
                                            key={index}
                                            className={`py-4 px-6 ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'}`}
                                        >
                                            {col.render
                                                ? col.render(item)
                                                : col.accessorKey ? (item[col.accessorKey] as ReactNode) : null
                                            }
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="py-20 text-center text-gray-400">
                                    {!isLoading && (
                                        <div className="flex flex-col items-center gap-2">
                                            <Sliders size={48} className="opacity-20 mb-2" />
                                            <p className="font-medium text-sm text-gray-400 uppercase tracking-widest">{emptyMessage}</p>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            {pagination && pagination.totalPages > 1 && (
                <div className="border-t border-gray-100 p-4 flex items-center justify-between bg-gray-50/30">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1} - {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalRecords)} of {pagination.totalRecords}
                    </span>
                    <div className="flex gap-2">
                        <button
                            disabled={!pagination.hasPreviousPage}
                            onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                            className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-600 disabled:opacity-50 hover:border-primary/20 hover:text-primary transition-all flex items-center gap-1"
                        >
                            <ChevronLeft size={14} />
                            Previous
                        </button>
                        <button
                            disabled={!pagination.hasNextPage}
                            onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                            className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-600 disabled:opacity-50 hover:border-primary/20 hover:text-primary transition-all flex items-center gap-1"
                        >
                            Next
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
