import React from 'react';
import type { CartItem as ICartItem } from '../../types/cart.types';
import { useCart } from '../../context/CartContext';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CartItemProps {
    item: ICartItem;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
    const { updateQuantity, removeItem, toggleSelection, isItemSelected } = useCart();

    // Cast populated fields (since backend now populates them)
    // Robust extraction: Check if it's a populated object (has _id/name/skuCode) or fallback
    const productRef = (item.productId as any)?.name ? (item.productId as any) : ((item.product as any)?.name ? item.product : {});
    const skuRef = (item.skuId as any)?.skuCode ? (item.skuId as any) : ((item.sku as any)?.skuCode ? item.sku : {});

    // Determine the ID used for operations (matches CartContext logic)
    const targetId = (item.skuId as any)?._id || (typeof item.skuId === 'string' ? item.skuId : '') ||
        (item.productId as any)?._id || (typeof item.productId === 'string' ? item.productId : '');

    const name = productRef?.name || 'Unknown Product';
    // Fallback image logic: SKU Image > Product Main Image > Placeholder
    const imageUrl = (skuRef?.media?.[0]?.fileStorageId as any)?.preSignedUrl ||
        skuRef?.media?.[0]?.url ||
        (productRef?.mainImage as any)?.preSignedUrl ||
        productRef?.mainImage ||
        '/placeholder-product.png';

    // Price Logic: Prioritize database SKU price > database Product price > snapshot item price
    const price = skuRef?.offerPrice || skuRef?.salePrice || skuRef?.basePrice ||
        productRef?.offerPrice || productRef?.salePrice || productRef?.basePrice ||
        (item.sku as any)?.price || (item.product as any)?.price ||
        item.salePrice || item.price || 0;

    console.log('CartItem render:', {
        id: item._id,
        qty: item.quantity,
        price,
        skuRef,
        productRef,
        itemRaw: item
    });

    // Format price
    const formattedPrice = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
    }).format(price);

    // Navigation URL Logic
    const productSlug = productRef?.slug || productRef?._id;
    // Extract SKU ID strictly for URL
    const skuIdRaw = (item.skuId as any)?._id || (typeof item.skuId === 'string' ? item.skuId : '') || (item.sku as any)?._id;
    const skuIdParam = skuIdRaw && typeof skuIdRaw === 'string' ? skuIdRaw : '';

    const productUrl = `/products/${productSlug}${skuIdParam ? `?skuId=${skuIdParam}` : ''}`;

    return (
        <div className="flex gap-4 p-4 bg-background rounded-2xl border border-primary/10 items-center mb-4 last:mb-0 shadow-sm shadow-primary/5">
            {/* Checkbox */}
            <div className="flex-shrink-0 pt-8" onClick={(e) => e.stopPropagation()}> 
                <input
                    type="checkbox"
                    checked={isItemSelected(targetId)}
                    onChange={() => toggleSelection(targetId)}
                    className="w-5 h-5 rounded border-2 border-primary/20 text-primary cursor-pointer"
                    style={{ accentColor: 'var(--primary)' }} // Inline style fallback
                />
            </div>

            {/* Image */}
            <div className="w-20 h-20 bg-primary/5 rounded-lg overflow-hidden flex-shrink-0 border border-primary/10 group relative z-10">
                {productRef && (
                    <Link to={productUrl} className="block w-full h-full">
                        <img src={imageUrl} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </Link>
                )}
            </div>

            {/* Details */}
            <div className="flex-1 flex flex-col justify-between min-h-[5rem]">
                <div>
                    <div className="flex justify-between items-start">
                        <Link to={productUrl} className="flex-1">
                            <h4 className="font-semibold text-primary line-clamp-1 hover:text-secondary transition-colors">{name}</h4>
                        </Link>
                        <button
                            onClick={() => removeItem(targetId)}
                            className="text-secondary/50 hover:text-red-500 transition-colors p-1 ml-2"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                    {skuRef?.variantAttributes && skuRef.variantAttributes.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-1">
                            {skuRef.variantAttributes.map((attr: any, idx: number) => (
                                <span key={idx} className="text-xs text-secondary font-medium bg-primary/5 px-2 py-0.5 rounded border border-primary/10">
                                    {attr.label || 'Option'}: {attr.value}
                                </span>
                            ))}
                        </div>
                    )}
                    {skuRef?.skuCode && (
                        <p className="text-[10px] text-secondary/60 mt-1 uppercase tracking-wider">SKU: {skuRef.skuCode}</p>
                    )}
                </div>

                <div className="flex justify-between items-end mt-2">
                    <div className="flex items-center border border-primary/10 rounded-lg bg-background">
                        <button
                            onClick={() => updateQuantity(targetId, Math.max(1, item.quantity - 1))}
                            className="p-1 px-2 hover:bg-primary/5 text-secondary disabled:opacity-50"
                            disabled={item.quantity <= 1}
                        >
                            <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-primary">{item.quantity}</span>
                        <button
                            onClick={() => updateQuantity(targetId, item.quantity + 1)}
                            className="p-1 px-2 hover:bg-primary/5 text-secondary"
                        >
                            <Plus size={14} />
                        </button>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="font-black text-primary text-lg font-mono tracking-tight">
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price * item.quantity)}
                        </span>
                        {item.quantity >= 1 && (
                            <span className="text-[10px] text-secondary/60 font-bold uppercase tracking-wider">
                                {formattedPrice} / Unit
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartItem;
