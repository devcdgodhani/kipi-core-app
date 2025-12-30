import React from 'react';
import { Table } from '../../components/common/Table';

const ManageProducts: React.FC = () => {
    const data = [1, 2, 3, 4, 5];

    const columns = [
        {
            header: 'Product',
            accessor: (item: number) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-secondary/20" />
                    <span className="font-semibold">Product Name {item}</span>
                </div>
            ),
        },
        {
            header: 'Category',
            accessor: () => <span className="text-primary/70">Electronics</span>,
        },
        {
            header: 'Price',
            accessor: () => <span className="font-semibold">$120.00</span>,
        },
        {
            header: 'Stock',
            accessor: () => <span className="text-green-600 font-semibold">In Stock (45)</span>,
        },
        {
            header: 'Actions',
            accessor: () => (
                <div className="flex gap-2">
                    <button className="text-sm font-bold text-primary hover:underline">Edit</button>
                    <button className="text-sm font-bold text-red-500 hover:underline">Delete</button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-primary">Manage Products</h1>
                <button className="px-6 py-3 bg-accent text-white rounded-lg font-bold hover:bg-accent/90 transition-all shadow-lg hover:shadow-accent/25">
                    + Add Product
                </button>
            </div>

            <Table
                data={data}
                columns={columns}
                keyExtractor={(item) => item}
            />
        </div>
    );
};

export default ManageProducts;
