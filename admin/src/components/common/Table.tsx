import React from 'react';

interface Column<T> {
    header: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
    className?: string;
}

interface TableProps<T> {
    data: T[];
    columns: Column<T>[];
    keyExtractor: (item: T) => string | number;
}

export function Table<T>({ data, columns, keyExtractor }: TableProps<T>) {
    return (
        <div className="bg-white rounded-2xl border border-primary/10 overflow-hidden shadow-sm">
            <table className="w-full text-left">
                <thead className="bg-primary text-white">
                    <tr>
                        {columns.map((col, index) => (
                            <th key={index} className={`p-4 font-semibold ${col.className || ''}`}>
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-primary/10">
                    {data.map((item) => (
                        <tr key={keyExtractor(item)} className="hover:bg-primary/5 transition-colors">
                            {columns.map((col, index) => (
                                <td key={index} className={`p-4 ${col.className || ''}`}>
                                    {typeof col.accessor === 'function'
                                        ? col.accessor(item)
                                        : (item[col.accessor] as React.ReactNode)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
