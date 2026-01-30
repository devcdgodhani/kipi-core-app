import React from 'react';
import type { CartItem as ICartItem } from '../../types/cart.types';
import { useCart } from '../../context/CartContext';
import { Minus, Plus, Trash2 } from 'lucide-react';

interface CartItemProps {
    item: ICartItem;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
    const { updateQuantity, removeItem } = useCart();

    // Cast populated fields (since backend now pupulates them)
    const productRef = (item.productId as any)?.name ? (item.productId as any) : (item.product || {});
    const skuRef = (item.skuId as any)?.skuCode ? (item.skuId as any) : (item.sku || {});

    const name = productRef?.name || 'Unknown Product';
    const imageUrl = (skuRef?.media?.[0]?.fileStorageId as any)?.preSignedUrl ||
        skuRef?.media?.[0]?.url ||
        (productRef?.mainImage as any)?.preSignedUrl ||
        productRef?.mainImage ||
        '/placeholder-product.png';
    const price = skuRef?.offerPrice || skuRef?.salePrice || skuRef?.basePrice ||
        productRef?.offerPrice || productRef?.salePrice || productRef?.basePrice ||
        item.salePrice || item.price || 0;

    // Format price
    const formattedPrice = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
    }).format(price);

    return (
        <div className="flex gap-4 py-4 border-b border-primary/10 last:border-0">
            {/* Image */}
            <div className="w-20 h-20 bg-primary/5 rounded-lg overflow-hidden flex-shrink-0 border border-primary/10">
                <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
            </div>

            {/* Details */}
            <div className="flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-primary line-clamp-1">{name}</h4>
                        <button
                            onClick={() => removeItem(item.skuId || item.productId)}
                            className="text-secondary/50 hover:text-red-500 transition-colors p-1"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                    {skuRef?.skuCode && (
                        <p className="text-xs text-secondary">SKU: {skuRef.skuCode}</p>
                    )}
                </div>

                <div className="flex justify-between items-end">
                    <div className="flex items-center border border-primary/10 rounded-lg bg-background">
                        <button
                            onClick={() => updateQuantity(item.skuId || item.productId, Math.max(1, item.quantity - 1))}
                            className="p-1 px-2 hover:bg-primary/5 text-secondary disabled:opacity-50"
                            disabled={item.quantity <= 1}
                        >
                            <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-primary">{item.quantity}</span>
                        <button
                            onClick={() => updateQuantity(item.skuId || item.productId, item.quantity + 1)}
                            className="p-1 px-2 hover:bg-primary/5 text-secondary"
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
