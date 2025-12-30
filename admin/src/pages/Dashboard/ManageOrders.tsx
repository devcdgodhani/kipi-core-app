import React from 'react';
import { Table } from '../../components/common/Table';

const ManageOrders: React.FC = () => {
    const data = [1, 2, 3, 4, 5];

    const columns = [
        {
            header: 'Order ID',
            accessor: (item: number) => <span className="font-semibold">#ORD-2025-{item}</span>,
        },
        {
            header: 'Customer',
            accessor: () => <span className="text-primary/70">John Doe</span>
        },
        {
            header: 'Date',
            accessor: () => <span className="text-primary/70">Dec 30, 2025</span>
        },
        {
            header: 'Total',
            accessor: () => <span className="font-semibold">$240.00</span>
        },
        {
            header: 'Status',
            accessor: () => (
                <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
                    Processing
                </span>
            )
        },
        {
            header: 'Actions',
            accessor: () => (
                <button className="text-sm font-bold text-primary hover:underline">View Details</button>
            )
        }
    ];

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-primary">Manage Orders</h1>
            <Table
                data={data}
                columns={columns}
                keyExtractor={(item) => item}
            />
        </div>
    );
};

export default ManageOrders;
