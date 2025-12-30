import React from 'react';
import { Table } from '../../components/common/Table';

const ManageUsers: React.FC = () => {
    const data = [1, 2, 3, 4, 5];

    const columns = [
        {
            header: 'User',
            accessor: (item: number) => <span className="font-semibold">User {item}</span>
        },
        {
            header: 'Email',
            accessor: (item: number) => <span className="text-primary/70">user{item}@example.com</span>
        },
        {
            header: 'Role',
            accessor: () => <span className="text-primary/70">Customer</span>
        },
        {
            header: 'Joined',
            accessor: () => <span className="text-primary/70">Dec 20, 2025</span>
        },
        {
            header: 'Actions',
            accessor: () => (
                <div className="flex gap-2">
                    <button className="text-sm font-bold text-primary hover:underline">Edit</button>
                    <button className="text-sm font-bold text-red-500 hover:underline">Block</button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-primary">Manage Users</h1>
            <Table
                data={data}
                columns={columns}
                keyExtractor={(item) => item}
            />
        </div>
    );
};

export default ManageUsers;
