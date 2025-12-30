import React from 'react';

const Orders: React.FC = () => {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-primary">My Orders</h1>

            <div className="space-y-4">
                {[1, 2, 3].map((order) => (
                    <div key={order} className="bg-white p-6 rounded-2xl border border-primary/10 flex justify-between items-center">
                        <div>
                            <p className="font-bold text-lg text-primary">Order #1234{order}</p>
                            <p className="text-sm text-primary/60">Placed on Dec 30, 2025</p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-primary">$240.00</p>
                            <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full mt-1">
                                Delivered
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Orders;
