import React from 'react';
import { useParams } from 'react-router-dom';

const ProductDetails: React.FC = () => {
    const { id } = useParams();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="aspect-square bg-primary/5 rounded-3xl overflow-hidden">
                <div className="w-full h-full bg-secondary/20" />
            </div>

            <div className="space-y-8">
                <div>
                    <h1 className="text-4xl font-bold text-primary mb-2">Premium Product {id}</h1>
                    <p className="text-2xl font-semibold text-primary/80">$120.00</p>
                </div>

                <p className="text-primary/70 leading-relaxed">
                    Experience the finest quality with our signature collection. Meticulously crafted
                    for durability and style, this product embodies the essence of modern elegance.
                </p>

                <div className="space-y-4">
                    <div className="flex gap-4">
                        <button className="flex-1 py-4 bg-accent text-white rounded-xl font-bold hover:bg-accent/90 transition-all shadow-lg hover:shadow-accent/25">
                            Add to Cart
                        </button>
                        <button className="px-6 py-4 border-2 border-primary text-primary rounded-xl font-bold hover:bg-primary/5 transition-all">
                            ♥
                        </button>
                    </div>
                </div>

                <div className="pt-8 border-t border-primary/10">
                    <h3 className="font-bold text-primary mb-4">Product Features</h3>
                    <ul className="list-disc list-inside text-primary/70 space-y-2">
                        <li>Premium materials</li>
                        <li>Handcrafted finish</li>
                        <li>Sustainable sourcing</li>
                        <li>2-year warranty</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
