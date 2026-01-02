import React from 'react';
import type { CartItem as ICartItem } from '../../types/cart.types';
import { useCart } from '../../context/CartContext';
import { Minus, Plus, Trash2 } from 'lucide-react';
import type { Product, SKU } from '../../types/product.types';

interface CartItemProps {
    item: ICartItem;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
    const { updateQuantity, removeItem } = useCart();

    // Cast populated fields (since backend now pupulates them)
    const product = item.productId as unknown as Product;
    const sku = item.skuId as unknown as SKU;

    // Fallbacks in case population fails or data missing
    const name = product?.name || 'Unknown Product';
    const imageUrl = sku?.media?.[0]?.url || product?.mainImage || '/placeholder-product.png';
    const price = (item.salePrice || item.price || 0);

    // Format price
    const formattedPrice = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD', // Should come from product currency
    }).format(price);

    return (
        <div className="flex gap-4 py-4 border-b border-gray-100 last:border-0">
            {/* Image */}
            <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
            </div>

            {/* Details */}
            <div className="flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-gray-900 line-clamp-1">{name}</h4>
                        <button
                            onClick={() => removeItem(item.skuId)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                    {sku?.skuCode && (
                        <p className="text-xs text-gray-500">SKU: {sku.skuCode}</p>
                    )}
                </div>

                <div className="flex justify-between items-end">
                    <div className="flex items-center border border-gray-200 rounded-lg bg-white">
                        <button
                            onClick={() => updateQuantity(item.skuId, Math.max(1, item.quantity - 1))}
                            className="p-1 px-2 hover:bg-gray-50 text-gray-600 disabled:opacity-50"
                            disabled={item.quantity <= 1}
                        >
                            <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                            onClick={() => updateQuantity(item.skuId, item.quantity + 1)}
                            className="p-1 px-2 hover:bg-gray-50 text-gray-600"
                        >
                            <Plus size={14} />
                        </button>
                    </div>
                    <span className="font-semibold text-primary">{formattedPrice}</span>
                </div>
            </div>
        </div>
    );
};

export default CartItem;
