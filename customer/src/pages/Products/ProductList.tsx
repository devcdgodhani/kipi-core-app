import React from 'react';

const ProductList: React.FC = () => {
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-primary">All Products</h1>
                <div className="flex gap-4">
                    <select className="px-4 py-2 rounded-lg bg-white border border-primary/20 text-primary">
                        <option>Sort by: Newest</option>
                        <option>Price: Low to High</option>
                        <option>Price: High to Low</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                    <div key={item} className="group cursor-pointer">
                        <div className="aspect-square bg-primary/5 rounded-2xl mb-4 overflow-hidden">
                            <div className="w-full h-full group-hover:scale-105 transition-transform duration-300 bg-secondary/20" />
                        </div>
                        <h3 className="font-bold text-lg text-primary">Premium Product {item}</h3>
                        <p className="text-primary/60">$120.00</p>
                        <button className="mt-2 text-sm font-semibold text-primary underline opacity-0 group-hover:opacity-100 transition-opacity">
                            Add to Cart
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductList;
