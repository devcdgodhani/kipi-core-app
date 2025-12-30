import React from 'react';

const Dashboard: React.FC = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Sales', value: '$12,450', change: '+12.5%' },
                    { label: 'Total Orders', value: '156', change: '+8.2%' },
                    { label: 'Active Users', value: '2,451', change: '+3.1%' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                        <p className="text-sm font-semibold text-primary/60 mb-1">{stat.label}</p>
                        <div className="flex items-end gap-3">
                            <span className="text-3xl font-bold">{stat.value}</span>
                            <span className="text-xs font-bold text-green-600 mb-1">{stat.change}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
