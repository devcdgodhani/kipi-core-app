import React from 'react';

export interface Column<T> {
    key: string;
    header: string;
    render?: (row: T) => React.ReactNode;
    width?: string;
    align?: 'left' | 'center' | 'right';
}

interface TableProps<T> {
    data: T[];
    columns: Column<T>[];
    isLoading?: boolean;
    emptyMessage?: string;
    onRowClick?: (row: T) => void;
}

export const Table = <T extends { _id?: string | number }>({
    data,
    columns,
    isLoading,
    emptyMessage = 'No data available',
    onRowClick
}: TableProps<T>) => {
    if (isLoading) {
        return (
            <div className="w-full h-64 flex items-center justify-center bg-surface/50 rounded-lg border border-border">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
            </div>
        );
    }

    return (
        <div className="w-full overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-text-secondary">
                    <thead className="bg-surface-hover/50 text-xs uppercase text-text-secondary font-bold tracking-wider">
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className={`px-6 py-3 font-black ${col.align ? `text-${col.align}` : ''}`}
                                    style={{ width: col.width }}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {data.length > 0 ? (
                            data.map((row, index) => (
                                <tr
                                    key={row._id || index}
                                    onClick={() => onRowClick && onRowClick(row)}
                                    className={`
                    hover:bg-surface-hover transition-colors
                    ${onRowClick ? 'cursor-pointer' : ''}
                  `}
                                >
                                    {columns.map((col) => (
                                        <td
                                            key={`${String(row._id)}-${col.key}`}
                                            className={`px-6 py-4 whitespace-nowrap text-text-primary font-medium ${col.align ? `text-${col.align}` : ''}`}
                                        >
                                            {col.render ? col.render(row) : (row as any)[col.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="px-6 py-8 text-center text-text-secondary"
                                >
                                    {emptyMessage}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
