import React from 'react';

const Home: React.FC = () => {
    return (
        <div className="space-y-12">
            <section className="relative h-[500px] rounded-3xl overflow-hidden bg-primary/5 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <h1 className="text-5xl font-bold text-primary">Discover Excellence</h1>
                    <p className="text-xl text-primary/70">Premium quality products for your lifestyle</p>
                    <button className="px-8 py-3 bg-primary text-background rounded-full font-bold hover:bg-primary/90 transition-all">
                        Shop Now
                    </button>
                </div>
            </section>

            <section>
                <h2 className="text-3xl font-bold text-primary mb-8 text-center">Featured Products</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {[1, 2, 3, 4].map((item) => (
                        <div key={item} className="group cursor-pointer">
                            <div className="aspect-square bg-primary/5 rounded-2xl mb-4 overflow-hidden">
                                {/* Image placeholder */}
                                <div className="w-full h-full group-hover:scale-105 transition-transform duration-300 bg-secondary/20" />
                            </div>
                            <h3 className="font-bold text-lg text-primary">Premium Product {item}</h3>
                            <p className="text-primary/60">$120.00</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Home;
