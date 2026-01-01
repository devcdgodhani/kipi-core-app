import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Save, Layers, Image as ImageIcon, Activity, Warehouse, Tag } from 'lucide-react';
import { skuService } from '../../services/sku.service';
import { productService } from '../../services/product.service';
import { lotService } from '../../services/lot.service';
import { type ISku, SKU_STATUS } from '../../types/sku';
import { type IProduct } from '../../types/product';
import { type IAttribute } from '../../types/attribute';
import { type ILot } from '../../types/lot';
import CustomInput from '../../components/common/Input';
import CustomButton from '../../components/common/Button';
import { MediaManager } from '../../components/common/MediaManager';
import { PopupModal } from '../../components/common/PopupModal';

const SkuForm: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const isEdit = !!id;

    const [formData, setFormData] = useState<Partial<ISku>>({
        productId: '',
        skuCode: '',
        variantAttributes: [],
        basePrice: 0,
        salePrice: 0,
        offerPrice: 0,
        discount: 0,
        quantity: 0,
        media: [],
        status: SKU_STATUS.ACTIVE,
        lotId: ''
    });

    const [allProducts, setAllProducts] = useState<IProduct[]>([]);
    const [allLots, setAllLots] = useState<ILot[]>([]);
    const [variantAttributes, setVariantAttributes] = useState<IAttribute[]>([]);
    const [parentProduct, setParentProduct] = useState<IProduct | null>(null);

    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [popup, setPopup] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'alert' | 'confirm' | 'prompt';
        onConfirm: () => void;
        loading?: boolean;
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'alert',
        onConfirm: () => { }
    });

    const fetchInitialData = useCallback(async () => {
        setPageLoading(true);
        try {
            const prodRes = await productService.getAll({});
            if (prodRes?.data) setAllProducts(prodRes.data);

            const lotRes = await lotService.getAll({});
            if (lotRes?.data) setAllLots(lotRes.data);

            if (isEdit) {
                const skuRes = await skuService.getOne(id!);
                if (skuRes?.data) {
                    const sku = skuRes.data;
                    setFormData({
                        ...sku,
                        productId: typeof sku.productId === 'object' ? (sku.productId as any)._id : sku.productId,
                        lotId: typeof sku.lotId === 'object' ? (sku.lotId as any)._id : sku.lotId,
                        variantAttributes: (Array.isArray(sku.variantAttributes) ? sku.variantAttributes : []).map((a: any) => ({
                            ...a,
                            attributeId: typeof a.attributeId === 'object' ? a.attributeId._id : a.attributeId
                        }))
                    });

                    // Pre-populate parent product data from the already populated SKU reference
                    if (sku.productId && typeof sku.productId === 'object') {
                        setParentProduct(sku.productId as any);
                    }

                    if (sku.productId) {
                        const pid = typeof sku.productId === 'object' ? (sku.productId as any)._id : sku.productId;
                        fetchVariantAttributes(pid);
                    }
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to initialize session');
        } finally {
            setPageLoading(false);
        }
    }, [id, isEdit]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    useEffect(() => {
        const prodId = searchParams.get('productId');
        if (prodId) {
            setFormData(prev => ({ ...prev, productId: prodId }));
            fetchVariantAttributes(prodId);
        }
    }, [searchParams]);

    const fetchVariantAttributes = async (productId: string) => {
        if (!productId) {
            setVariantAttributes([]);
            setParentProduct(null);
            return;
        }
        try {
            const prodRes = await productService.getOne(productId);
            const product = prodRes?.data;
            if (product) {
                setParentProduct(product);
                // Extract unique attributes from product
                const attrs = product.attributes?.map((a: any) => a.attributeId) || [];
                setVariantAttributes(attrs);
            }
        } catch (err) {
            console.error('Failed to fetch variant attributes', err);
            setVariantAttributes([]);
        }
    };

    const onProductChange = (productId: string) => {
        setFormData(prev => ({ ...prev, productId }));
        if (productId) {
            fetchVariantAttributes(productId);
        } else {
            setVariantAttributes([]);
        }
    };

    const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const numValue = Number(value);

        setFormData(prev => {
            const next = {
                ...prev,
                [name]: ['basePrice', 'salePrice', 'offerPrice', 'quantity'].includes(name) ? numValue : value
            };

            if (name === 'salePrice' || name === 'offerPrice') {
                const sPrice = name === 'salePrice' ? numValue : (prev.salePrice || 0);
                const oPrice = name === 'offerPrice' ? numValue : (prev.offerPrice || 0);
                if (sPrice > 0) {
                    next.discount = Math.round(((sPrice - oPrice) / sPrice) * 100);
                } else {
                    next.discount = 0;
                }
            }
            return next;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const skuCode = formData.skuCode?.trim() || '';
            const skuRegex = /^[a-zA-Z0-9](.*[a-zA-Z0-9])?$/;
            if (!skuRegex.test(skuCode)) {
                setError(`Architecture Violation: SKU "${skuCode}" must start and end with a letter or number.`);
                setLoading(false);
                return;
            }

            const cleanMedia = (formData.media || []).map(m => ({
                ...m,
                fileStorageId: (m.fileStorageId && typeof m.fileStorageId === 'object') ? (m.fileStorageId as any)._id : (m.fileStorageId || null)
            }));

            const submitData = {
                ...formData,
                skuCode,
                productId: (formData.productId && typeof formData.productId === 'object') ? (formData.productId as any)._id : (formData.productId || null),
                lotId: (formData.lotId && typeof formData.lotId === 'object') ? (formData.lotId as any)._id : (formData.lotId || null),
                media: cleanMedia
            };

            if (isEdit) {
                await skuService.update(id!, submitData);
                setSuccess('SKU parameters refined successfully!');
                setTimeout(() => fetchInitialData(), 1000);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Transaction error');
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) return <div className="p-12 text-center text-primary font-bold animate-pulse">Accessing Secure Vault...</div>;

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header Area */}
            <div className="flex items-center justify-between bg-white p-6 rounded-[2rem] border border-primary/5 shadow-sm">
                <div className="flex items-center gap-4">
                    <button type="button" onClick={() => navigate(-1)} className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all shadow-sm group">
                        <ChevronLeft size={24} className="text-gray-400 group-hover:text-primary transition-colors" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase font-mono">{isEdit ? 'Refine SKU Architecture' : 'SKU Configuration'}</h1>
                        <p className="text-[10px] text-primary font-black uppercase tracking-[0.3em]">Variant Identity & Lifecycle Portal</p>
                    </div>
                </div>
                {isEdit && (
                    <div className="hidden md:flex items-center gap-3 px-6 py-2 bg-emerald-50 rounded-full border border-emerald-100">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active In Master Catalog</span>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-[3.5rem] border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden">
                <div className="p-12 space-y-16">
                    {/* section 1: Identity & Parameters */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        <section className="space-y-10">
                            <div className="space-y-2 border-l-4 border-primary pl-6">
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Tag size={18} className="text-primary" /> Identity Hub
                                </h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Establish core variant parameters</p>
                            </div>

                            <div className="space-y-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Parent Lifecycle Product</label>
                                    <select
                                        name="productId"
                                        value={typeof formData.productId === 'object' ? (formData.productId as any)._id : (formData.productId || '')}
                                        onChange={(e) => onProductChange(e.target.value)}
                                        className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl py-4 px-5 focus:outline-none focus:border-primary/30 transition-all font-bold text-gray-700 text-sm"
                                        required
                                        disabled={isEdit}
                                    >
                                        <option value="">Select Target Product</option>
                                        {allProducts.map(p => (
                                            <option key={p._id} value={p._id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <CustomInput label="Unique SKU Code" name="skuCode" value={formData.skuCode || ''} onChange={handleGeneralChange} placeholder="e.g. TSHIRT-RED-L" required disabled={isEdit} />

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <CustomInput label="Base Price" name="basePrice" type="number" value={formData.basePrice || 0} onChange={handleGeneralChange} />
                                    <CustomInput label="Sale Price" name="salePrice" type="number" value={formData.salePrice || 0} onChange={handleGeneralChange} />
                                    <CustomInput label="Offer Price" name="offerPrice" type="number" value={formData.offerPrice || 0} onChange={handleGeneralChange} />
                                </div>
                                <div className="bg-primary/5 p-4 rounded-2xl flex items-center justify-between">
                                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">Architecture Discount</span>
                                    <span className="text-lg font-black text-primary">{formData.discount || 0}%</span>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-10">
                            <div className="space-y-2 border-l-4 border-primary pl-6">
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Layers size={18} className="text-primary" /> Variant Specifications
                                </h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Physical & visual attributes</p>
                            </div>

                            {variantAttributes.length === 0 ? (
                                <div className="py-20 text-center text-gray-400 font-bold uppercase text-[10px] bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-100">
                                    No variants detected for current parent
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {variantAttributes.map(attr => {
                                        // Try to find value in SKU variantAttributes (for unique variant values)
                                        const skuValObj = formData.variantAttributes?.find(a => (typeof a.attributeId === 'object' ? (a.attributeId as any)._id : a.attributeId) === attr._id);

                                        // Try to find value in Product attributes (for shared specification values)
                                        const parentProduct = allProducts.find(p => p._id === (typeof formData.productId === 'object' ? (formData.productId as any)._id : formData.productId));
                                        const productValObj = parentProduct?.attributes?.find(a => (typeof a.attributeId === 'object' ? (a.attributeId as any)._id : a.attributeId) === attr._id);

                                        const displayValue = skuValObj?.value ?? productValObj?.value ?? '';

                                        return (
                                            <div key={attr._id} className="space-y-3">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
                                                    {attr.name} {attr.isVariant ? '(Variant)' : '(Spec)'}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={displayValue}
                                                    readOnly
                                                    disabled
                                                    className="w-full border-2 border-gray-100 bg-gray-50/50 rounded-2xl py-4 px-5 font-bold text-gray-500 text-sm shadow-sm cursor-not-allowed opacity-75"
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Section 2: Logistics & Lifecycle */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 pt-16 border-t border-gray-50">
                        <section className="space-y-10">
                            <div className="space-y-2 border-l-4 border-indigo-500 pl-6">
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Warehouse size={18} className="text-indigo-500" /> Warehousing
                                </h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Stock location & quantities</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Allocated Lot</label>
                                    <select
                                        name="lotId"
                                        value={formData.lotId || ''}
                                        onChange={handleGeneralChange}
                                        className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl py-4 px-5 focus:outline-none focus:border-primary/30 transition-all font-bold text-gray-700 text-sm"
                                    >
                                        <option value="">General Stock (No Lot)</option>
                                        {allLots.map(l => (
                                            <option key={l._id} value={l._id}>{l.lotNumber} ({l.remainingQuantity} units)</option>
                                        ))}
                                    </select>
                                </div>
                                <CustomInput label="Stock Quantity" name="quantity" type="number" value={formData.quantity || 0} onChange={handleGeneralChange} />
                            </div>
                        </section>

                        <section className="space-y-10">
                            <div className="space-y-2 border-l-4 border-amber-500 pl-6">
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Activity size={18} className="text-amber-500" /> Lifecycle Status
                                </h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Visibility & availability</p>
                            </div>

                            <select
                                name="status"
                                value={formData.status || ''}
                                onChange={handleGeneralChange}
                                className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl py-5 px-6 focus:outline-none focus:border-primary/30 transition-all font-black text-gray-700 tracking-widest uppercase text-xs"
                            >
                                {Object.values(SKU_STATUS).map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </section>
                    </div>

                    {/* Section 3: Media */}
                    <section className="space-y-10 pt-16 border-t border-gray-50">
                        <div className="space-y-2 border-l-4 border-rose-500 pl-6 mb-6">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em] flex items-center gap-2">
                                <ImageIcon size={18} className="text-rose-500" /> Media Collection
                            </h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Variant-specific visual assets</p>
                        </div>

                        <MediaManager
                            media={formData.media || []}
                            onChange={(media) => setFormData(prev => ({ ...prev, media: media }))}
                            storageDir={formData.skuCode}
                            storageDirPath={(parentProduct?.productCode && formData.skuCode) ? `product/${parentProduct.productCode}/${formData.skuCode}` : undefined}
                            parentMedia={parentProduct?.media}
                        />
                    </section>
                </div>

                {/* Footer Actions */}
                <div className="bg-gray-50/80 backdrop-blur-sm p-8 flex items-center justify-between border-t border-gray-100">
                    <div className="max-w-md">
                        {error && <div className="text-[10px] font-black text-rose-600 uppercase tracking-widest bg-white px-4 py-2 rounded-xl border border-rose-100">{error}</div>}
                        {success && <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-white px-4 py-2 rounded-xl border border-emerald-100">{success}</div>}
                    </div>

                    <div className="flex gap-4">
                        <button type="button" onClick={() => navigate(-1)} className="px-8 py-4 bg-white border border-gray-200 rounded-2xl text-[11px] font-black text-gray-500 uppercase tracking-widest hover:bg-gray-100 transition-all">
                            Abandon
                        </button>
                        {isEdit ? (
                            <CustomButton type="submit" disabled={loading} className="rounded-2xl h-14 px-12 shadow-xl shadow-primary/20 text-[11px] font-black uppercase tracking-[0.2em]">
                                <Save size={18} className="mr-3" /> {loading ? 'Synchronizing...' : 'Sync Variant Architecture'}
                            </CustomButton>
                        ) : (
                            <div className="px-6 py-4 bg-amber-50 rounded-2xl border border-amber-100 text-[10px] font-black text-amber-600 uppercase tracking-widest">
                                Restricted Creation Engine
                            </div>
                        )}
                    </div>
                </div>
            </form>

            <PopupModal
                isOpen={popup.isOpen}
                onClose={() => setPopup(prev => ({ ...prev, isOpen: false }))}
                title={popup.title}
                message={popup.message}
                type={popup.type}
                onConfirm={popup.onConfirm}
                loading={popup.loading}
            />
        </div>
    );
};

export default SkuForm;
