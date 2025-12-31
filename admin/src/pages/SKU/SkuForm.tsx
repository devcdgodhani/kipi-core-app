import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Save, Barcode, Layers, Plus, Image as ImageIcon } from 'lucide-react';
import { skuService } from '../../services/sku.service';
import { productService } from '../../services/product.service';
import { attributeService } from '../../services/attribute.service';
import { lotService } from '../../services/lot.service';
import { type ISku, SKU_STATUS } from '../../types/sku';
import { type IProduct } from '../../types/product';
import { type IAttribute } from '../../types/attribute';
import { type ILot } from '../../types/lot';
import CustomInput from '../../components/common/Input';
import CustomButton from '../../components/common/Button';
import { ROUTES } from '../../routes/routeConfig';

const SkuForm: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const isEdit = !!id;

    const [formData, setFormData] = useState<Partial<ISku>>({
        productId: '',
        skuCode: '',
        variantAttributes: [],
        price: 0,
        salePrice: 0,
        quantity: 0,
        images: [],
        status: SKU_STATUS.ACTIVE,
        lotId: ''
    });

    const [allProducts, setAllProducts] = useState<IProduct[]>([]);
    const [allLots, setAllLots] = useState<ILot[]>([]);
    const [variantAttributes, setVariantAttributes] = useState<IAttribute[]>([]);
    const [siblingSkus, setSiblingSkus] = useState<ISku[]>([]);

    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

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

                    if (sku.productId) {
                        const pid = typeof sku.productId === 'object' ? (sku.productId as any)._id : sku.productId;
                        fetchVariantAttributes(pid);
                        fetchSiblingSkus(pid);
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
            fetchSiblingSkus(prodId);
        }
    }, [searchParams]);

    const fetchSiblingSkus = async (productId: string) => {
        try {
            const res = await skuService.getAll({ productId });
            if (res?.data) setSiblingSkus(res.data);
        } catch (err) {
            console.error('Failed to fetch sibling SKUs', err);
        }
    };

    const fetchVariantAttributes = async (productId: string) => {
        if (!productId) {
            setVariantAttributes([]);
            return;
        }
        try {
            const prodRes = await productService.getOne(productId);
            // According to axios interceptor, prodRes is the response body: { data: Product, ... }
            const product = prodRes?.data;
            if (product) {
                const categoryIds = (product.categoryIds || []).map((c: any) =>
                    typeof c === 'object' ? c._id : c
                );

                if (categoryIds.length > 0) {
                    const attrRes = await attributeService.getAll({
                        categoryIds: categoryIds as any,
                        isVariant: true
                    });
                    if (attrRes?.data) setVariantAttributes(attrRes.data);
                } else {
                    setVariantAttributes([]);
                }
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
            fetchSiblingSkus(productId);
        } else {
            setVariantAttributes([]);
            setSiblingSkus([]);
        }
    };

    const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'price' || name === 'salePrice' || name === 'quantity' ? Number(value) : value
        }));
    };

    const handleVariantAttrChange = (attrId: string, value: any) => {
        setFormData(prev => {
            const current = [...(prev.variantAttributes || [])];
            const index = current.findIndex(a =>
                (typeof a.attributeId === 'object' ? (a.attributeId as any)._id : a.attributeId) === attrId
            );

            if (index > -1) {
                current[index] = { ...current[index], value };
            } else {
                current.push({ attributeId: attrId, value });
            }

            return { ...prev, variantAttributes: current };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            if (isEdit) {
                await skuService.update(id!, formData);
                setSuccess('SKU parameters refined successfully!');
                setTimeout(() => fetchInitialData(), 1000);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Transaction error');
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) return <div className="p-12 text-center text-primary font-bold">Accessing Secure Vault...</div>;

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between bg-white p-6 rounded-[2rem] border border-primary/5 shadow-sm">
                <div className="flex items-center gap-4">
                    <button type="button" onClick={() => navigate(-1)} className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all shadow-sm group">
                        <ChevronLeft size={24} className="text-gray-400 group-hover:text-primary transition-colors" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase font-mono">{isEdit ? 'Refine SKU Architecture' : 'SKU Configuration'}</h1>
                        <p className="text-[10px] text-primary font-black uppercase tracking-[0.3em]">Lifecycle & Variant Identity Management</p>
                    </div>
                </div>
                {isEdit && (
                    <div className="flex items-center gap-3 px-6 py-2 bg-emerald-50 rounded-full border border-emerald-100">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active In Master Catalog</span>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 space-y-6 animate-fade-in">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Parent Lifecycle Product</label>
                            <select
                                name="productId"
                                value={typeof formData.productId === 'object' ? (formData.productId as any)._id : (formData.productId || '')}
                                onChange={(e) => onProductChange(e.target.value)}
                                className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl py-4 px-4 focus:outline-none focus:border-primary/30 transition-all font-bold text-gray-700"
                                required
                                disabled={isEdit}
                            >
                                <option value="">Select Target Product</option>
                                {allProducts.map(p => (
                                    <option key={p._id} value={p._id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        <CustomInput label="Unique SKU Code" name="skuCode" value={formData.skuCode || ''} onChange={handleGeneralChange} placeholder="e.g. TSHIRT-RED-L" required />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <CustomInput label="Variant Unit Price" name="price" type="number" value={formData.price || 0} onChange={handleGeneralChange} />
                            <CustomInput label="Platform Offer Price" name="salePrice" type="number" value={formData.salePrice || 0} onChange={handleGeneralChange} />
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-200/40 space-y-8">
                        <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                            <h3 className="font-black text-gray-900 uppercase text-xs tracking-[0.2em] flex items-center gap-2">
                                <Layers size={18} className="text-primary" /> Variant Specifications
                            </h3>
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full">Immutable Identity</span>
                        </div>
                        {variantAttributes.length === 0 ? (
                            <div className="py-12 text-center text-gray-400 font-bold uppercase text-[10px] bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-100">
                                No variant attributes detected for the parent product
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {variantAttributes.map(attr => {
                                    const valObj = formData.variantAttributes?.find(a => (typeof a.attributeId === 'object' ? (a.attributeId as any)._id : a.attributeId) === attr._id);
                                    return (
                                        <div key={attr._id} className="space-y-3 group">
                                            <label className="text-[10px] font-black text-gray-400 group-focus-within:text-primary uppercase tracking-[0.2em] ml-1 transition-colors">{attr.name}</label>
                                            {attr.inputType === 'DROPDOWN' || attr.valueType === 'SELECT' ? (
                                                <select
                                                    value={valObj?.value || ''}
                                                    onChange={(e) => handleVariantAttrChange(attr._id, e.target.value)}
                                                    className="w-full border-2 border-gray-100 bg-gray-50/30 rounded-[1.2rem] py-4 px-5 focus:outline-none focus:border-primary/30 focus:bg-white transition-all font-bold text-gray-700 text-sm shadow-sm"
                                                >
                                                    <option value="">Select Option</option>
                                                    {attr.options?.map(o => (
                                                        <option key={o.value} value={o.value}>{o.label}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input
                                                    type="text"
                                                    value={valObj?.value || ''}
                                                    onChange={(e) => handleVariantAttrChange(attr._id, e.target.value)}
                                                    className="w-full border-2 border-gray-100 bg-gray-50/30 rounded-[1.2rem] py-4 px-5 focus:outline-none focus:border-primary/30 focus:bg-white transition-all font-bold text-gray-700 text-sm shadow-sm"
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 space-y-6">
                        <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest">Warehousing</h3>
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Allocated Lot</label>
                            <select
                                name="lotId"
                                value={formData.lotId || ''}
                                onChange={handleGeneralChange}
                                className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl py-4 px-4 focus:outline-none focus:border-primary/30 transition-all font-bold text-gray-700"
                            >
                                <option value="">General Stock (No Lot)</option>
                                {allLots.map(l => (
                                    <option key={l._id} value={l._id}>{l.lotNumber} ({l.remainingQuantity} units)</option>
                                ))}
                            </select>
                        </div>
                        <CustomInput label="Stock Quantity" name="quantity" type="number" value={formData.quantity || 0} onChange={handleGeneralChange} />
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 space-y-6">
                        <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest">Lifecycle</h3>
                        <select
                            name="status"
                            value={formData.status || ''}
                            onChange={handleGeneralChange}
                            className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl py-4 px-4 focus:outline-none focus:border-primary/30 transition-all font-bold text-gray-700"
                        >
                            {Object.values(SKU_STATUS).map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 space-y-6">
                        <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest flex items-center gap-2">
                            <ImageIcon size={16} className="text-primary" /> Media Assets
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Gallery Collection</label>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, images: [...(prev.images || []), ''] }))}
                                    className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                                >
                                    + Add Image
                                </button>
                            </div>
                            <div className="space-y-3">
                                {(formData.images || []).map((img, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <input
                                            value={img}
                                            onChange={(e) => {
                                                const newImgs = [...(formData.images || [])];
                                                newImgs[idx] = e.target.value;
                                                setFormData(prev => ({ ...prev, images: newImgs }));
                                            }}
                                            className="flex-1 border-2 border-gray-100 bg-gray-50 rounded-xl py-3 px-4 focus:outline-none focus:border-primary/30 font-bold text-gray-700 text-xs"
                                            placeholder="Image URL..."
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newImgs = (formData.images || []).filter((_, i) => i !== idx);
                                                setFormData(prev => ({ ...prev, images: newImgs }));
                                            }}
                                            className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition-colors"
                                        >
                                            <Plus size={16} className="rotate-45" />
                                        </button>
                                    </div>
                                ))}
                                {(!formData.images || formData.images.length === 0) && (
                                    <div className="py-4 text-center text-gray-400 text-[10px] font-bold uppercase border-2 border-dashed border-gray-50 rounded-xl">No media provided</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-2xl shadow-gray-200/40 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="font-black text-gray-900 uppercase text-xs tracking-[0.2em] flex items-center gap-2">
                                <Barcode size={18} className="text-primary" /> Architecture Siblings
                            </h3>
                            <div className="px-2 py-1 bg-primary/5 rounded-lg text-[9px] font-black text-primary uppercase">{siblingSkus.length} Items</div>
                        </div>
                        <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {siblingSkus.map(sku => (
                                <div
                                    key={sku._id}
                                    onClick={() => navigate('/' + ROUTES.DASHBOARD.SKUS_EDIT.replace(':id', sku._id!))}
                                    className={`p-4 rounded-[1.5rem] border-2 transition-all cursor-pointer flex items-center justify-between group ${sku._id === id ? 'border-primary bg-primary/5 shadow-inner' : 'border-gray-50 hover:border-primary/20 bg-gray-50/30'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${sku._id === id ? 'bg-primary text-white' : 'bg-white border border-gray-100 text-gray-400 group-hover:text-primary'}`}>
                                            <Barcode size={18} />
                                        </div>
                                        <div>
                                            <span className="text-[11px] font-black text-gray-900 uppercase block tracking-tight">{sku.skuCode}</span>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] font-bold text-primary">₹{sku.salePrice || sku.price}</span>
                                                <span className="w-1 h-1 rounded-full bg-gray-300" />
                                                <span className="text-[10px] font-bold text-gray-400">{sku.quantity} units</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`w-2.5 h-2.5 rounded-full border-4 border-white shadow-sm ${sku.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                                </div>
                            ))}
                            {siblingSkus.length === 0 && (
                                <div className="text-center py-12 bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-100">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Single Architecture Variant</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        {error && <div className="p-4 bg-rose-50 text-rose-600 rounded-[1.5rem] border border-rose-100 text-[10px] font-black uppercase tracking-widest text-center">{error}</div>}
                        {success && <div className="p-4 bg-emerald-50 text-emerald-600 rounded-[1.5rem] border border-emerald-100 text-[10px] font-black uppercase tracking-widest text-center">{success}</div>}

                        {isEdit ? (
                            <CustomButton type="submit" disabled={loading} className="w-full rounded-[1.5rem] h-16 shadow-2xl shadow-primary/30 text-xs font-black uppercase tracking-[0.2em]">
                                <Save size={20} className="mr-3" /> {loading ? 'Synchronizing...' : 'Sync Variant Adjustments'}
                            </CustomButton>
                        ) : (
                            <div className="p-6 bg-amber-50 rounded-[1.5rem] border border-amber-100 text-center">
                                <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest leading-relaxed">
                                    Manual SKU creation is restricted. Use the Product Configuration Engine to generate new variants.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
};

export default SkuForm;
