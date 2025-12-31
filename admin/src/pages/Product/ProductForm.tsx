import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ChevronLeft,
    Save,
    Image as ImageIcon,
    Tag,
    IndianRupee,
    Box,
    Settings,
    Layers,
    Trash2,
    PlusCircle,
    Info,
    CheckCircle2,
    Barcode,
    Edit2
} from 'lucide-react';
import { productService } from '../../services/product.service';
import { categoryService } from '../../services/category.service';
import { attributeService } from '../../services/attribute.service';
import { skuService } from '../../services/sku.service';
import { PRODUCT_STATUS, type IProduct } from '../../types/product';
import { type ICategory } from '../../types/category';
import { type IAttribute } from '../../types/attribute';
import { type ISku } from '../../types/sku';
import CustomInput from '../../components/common/Input';
import CustomButton from '../../components/common/Button';
import { ROUTES } from '../../routes/routeConfig';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

const ProductForm: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEdit = !!id;

    const [formData, setFormData] = useState<Partial<IProduct>>({
        name: '',
        description: '',
        basePrice: 0,
        salePrice: 0,
        discount: 0,
        currency: 'INR',
        status: PRODUCT_STATUS.DRAFT,
        categoryIds: [],
        attributes: [],
        images: [],
        mainImage: '',
        stock: 0
    });

    const [allCategories, setAllCategories] = useState<ICategory[]>([]);
    const [relevantAttributes, setRelevantAttributes] = useState<IAttribute[]>([]);
    const [productSkus, setProductSkus] = useState<ISku[]>([]);

    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const fetchInitialData = useCallback(async () => {
        setPageLoading(true);
        try {
            const catRes = await categoryService.getAll({ isTree: false });
            if (catRes?.data) setAllCategories(catRes.data);

            if (isEdit) {
                const prodRes = await productService.getOne(id!);
                if (prodRes?.data) {
                    const prod = prodRes.data;
                    setFormData({
                        ...prod,
                        categoryIds: (Array.isArray(prod.categoryIds) ? prod.categoryIds : []).map((c: any) => typeof c === 'object' ? c._id : c),
                        attributes: (Array.isArray(prod.attributes) ? prod.attributes : []).map((a: any) => ({
                            ...a,
                            attributeId: typeof a.attributeId === 'object' ? a.attributeId._id : a.attributeId
                        }))
                    });

                    // Fetch associated SKUs
                    const skuRes = await skuService.getAll({ productId: id });
                    if (skuRes?.data) setProductSkus(skuRes.data);
                }
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load data');
        } finally {
            setPageLoading(false);
        }
    }, [id, isEdit]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    // Fetch attributes based on selected categories
    useEffect(() => {
        const fetchAttributes = async () => {
            const categoryIds = (formData.categoryIds || []) as string[];
            if (categoryIds.length === 0) {
                setRelevantAttributes([]);
                return;
            }

            try {
                // Find all unique attribute IDs from selected categories
                const selectedCats = allCategories.filter(cat =>
                    categoryIds.includes(cat._id)
                );

                const allAttrIds = Array.from(new Set(
                    selectedCats.flatMap(cat => cat.attributeIds || [])
                ));

                if (allAttrIds.length > 0) {
                    const attrRes = await attributeService.getAll({ _id: allAttrIds as any });
                    if (attrRes?.data) setRelevantAttributes(attrRes.data);
                } else {
                    setRelevantAttributes([]);
                }
            } catch (err) {
                console.error('Failed to fetch relevant attributes', err);
            }
        };

        fetchAttributes();
    }, [formData.categoryIds, allCategories]);

    const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'basePrice' || name === 'salePrice' || name === 'discount' ? Number(value) : value
        }));
    };

    const handleCategoryToggle = (catId: string) => {
        setFormData(prev => {
            const current = (prev.categoryIds as string[]) || [];
            const exists = current.includes(catId);
            return {
                ...prev,
                categoryIds: exists ? current.filter(id => id !== catId) : [...current, catId]
            };
        });
    };

    const handleAttributeValueChange = (attrId: string, value: any, label?: string) => {
        setFormData(prev => {
            const currentAttrs = [...(prev.attributes || [])];
            const index = currentAttrs.findIndex(a =>
                (typeof a.attributeId === 'object' ? (a.attributeId as any)._id : a.attributeId) === attrId
            );

            if (index > -1) {
                currentAttrs[index] = { ...currentAttrs[index], value, label };
            } else {
                currentAttrs.push({ attributeId: attrId, value, label });
            }

            return { ...prev, attributes: currentAttrs };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            if (isEdit) {
                await productService.update(id!, formData);
                setSuccess('Product architecture updated successfully!');
            } else {
                const res = await productService.create(formData);
                setSuccess('New product established successfully!');
                setTimeout(() => {
                    navigate('/' + ROUTES.DASHBOARD.PRODUCTS_EDIT.replace(':id', (res.data as any)._id));
                }, 1500);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Transaction failed');
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) return <div className="p-12 text-center text-primary font-bold animate-pulse">Synchronizing Data...</div>;

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between bg-white p-6 rounded-[2rem] border border-primary/5 shadow-sm">
                <div className="flex items-center gap-4">
                    <button type="button" onClick={() => navigate(-1)} className="p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                        <ChevronLeft size={24} className="text-gray-700" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-primary tracking-tight uppercase font-mono">{isEdit ? 'Refine Product' : 'Establish Product'}</h1>
                        <p className="text-sm text-gray-500 font-medium">Configure core details, attributes and variants</p>
                    </div>
                </div>
                {success && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 animate-in fade-in slide-in-from-right-4">
                        <CheckCircle2 size={18} />
                        <span className="text-xs font-bold uppercase tracking-wider">{success}</span>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Tabs className="react-tabs-custom">
                    <TabList className="flex gap-2 p-1 bg-gray-50 rounded-[2rem] border-2 border-gray-100 mb-6 font-mono overflow-x-auto">
                        <Tab className="flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-[1.5rem] cursor-pointer transition-all font-black text-[10px] uppercase tracking-widest outline-none border-none text-gray-400 aria-selected:bg-white aria-selected:text-primary aria-selected:shadow-xl aria-selected:shadow-gray-200 min-w-[150px]">
                            <Info size={16} /> Basic Details
                        </Tab>
                        <Tab className="flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-[1.5rem] cursor-pointer transition-all font-black text-[10px] uppercase tracking-widest outline-none border-none text-gray-400 aria-selected:bg-white aria-selected:text-primary aria-selected:shadow-xl aria-selected:shadow-gray-200 min-w-[150px]">
                            <Layers size={16} /> Taxonomy & Attrs
                        </Tab>
                        <Tab className="flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-[1.5rem] cursor-pointer transition-all font-black text-[10px] uppercase tracking-widest outline-none border-none text-gray-400 aria-selected:bg-white aria-selected:text-primary aria-selected:shadow-xl aria-selected:shadow-gray-200 min-w-[150px]">
                            <IndianRupee size={16} /> Pricing Hub
                        </Tab>
                        <Tab className="flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-[1.5rem] cursor-pointer transition-all font-black text-[10px] uppercase tracking-widest outline-none border-none text-gray-400 aria-selected:bg-white aria-selected:text-primary aria-selected:shadow-xl aria-selected:shadow-gray-200 min-w-[150px]">
                            <ImageIcon size={16} /> Media Assets
                        </Tab>
                        <Tab disabled={!isEdit} className="flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-[1.5rem] cursor-pointer transition-all font-black text-[10px] uppercase tracking-widest outline-none border-none text-gray-400 aria-selected:bg-white aria-selected:text-primary aria-selected:shadow-xl aria-selected:shadow-gray-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[150px]">
                            <Barcode size={16} /> SKUs / Variants
                        </Tab>
                    </TabList>

                    <TabPanel>
                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 space-y-6 animate-fade-in text-gray-700">
                            <CustomInput label="Product Name" name="name" value={formData.name || ''} onChange={handleGeneralChange} placeholder="e.g. Premium Cotton T-Shirt" required />
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Narrative / Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description || ''}
                                    onChange={handleGeneralChange}
                                    className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl py-4 px-4 focus:outline-none focus:border-primary/30 transition-all font-bold text-gray-700 min-h-[150px]"
                                    placeholder="Detailed product story..."
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Market Status</label>
                                <select
                                    name="status"
                                    value={formData.status || ''}
                                    onChange={handleGeneralChange}
                                    className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl py-4 px-4 focus:outline-none focus:border-primary/30 transition-all font-bold text-gray-700"
                                >
                                    {Object.values(PRODUCT_STATUS).map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </TabPanel>

                    <TabPanel>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in text-gray-700">
                            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50">
                                <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest mb-6 flex items-center gap-2">
                                    <Tag size={16} className="text-primary" /> Select Categories
                                </h3>
                                <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                                    {allCategories.map(cat => {
                                        const categoryIds = (formData.categoryIds || []) as string[];
                                        const isSelected = categoryIds.includes(cat._id);
                                        return (
                                            <div
                                                key={cat._id}
                                                onClick={() => handleCategoryToggle(cat._id)}
                                                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${isSelected ? 'bg-primary border-primary text-white' : 'bg-gray-50 border-transparent text-gray-600 hover:border-gray-200'
                                                    }`}
                                            >
                                                <span className="text-xs font-bold">{cat.name}</span>
                                                {isSelected && <CheckCircle2 size={14} />}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50">
                                <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest mb-6 flex items-center gap-2">
                                    <Settings size={16} className="text-primary" /> Dynamic Attributes
                                </h3>
                                {((formData.categoryIds || []) as string[]).length === 0 ? (
                                    <div className="text-center py-12 text-gray-400">
                                        <Info size={32} className="mx-auto mb-2 opacity-20" />
                                        <p className="text-xs font-bold uppercase tracking-widest">Select categories to reveal attributes</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {relevantAttributes.map(attr => {
                                            const valObj = formData.attributes?.find(a => (typeof a.attributeId === 'object' ? (a.attributeId as any)._id : a.attributeId) === attr._id);
                                            return (
                                                <div key={attr._id} className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{attr.name}</label>
                                                    {attr.inputType === 'DROPDOWN' || attr.valueType === 'SELECT' ? (
                                                        <select
                                                            value={valObj?.value || ''}
                                                            onChange={(e) => handleAttributeValueChange(attr._id, e.target.value)}
                                                            className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl py-3 px-4 focus:outline-none focus:border-primary/30 font-bold text-gray-700 text-sm"
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
                                                            onChange={(e) => handleAttributeValueChange(attr._id, e.target.value)}
                                                            className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl py-3 px-4 focus:outline-none focus:border-primary/30 font-bold text-gray-700 text-sm"
                                                            placeholder={`Enter ${attr.name}...`}
                                                        />
                                                    )}
                                                </div>
                                            );
                                        })}
                                        {relevantAttributes.length === 0 && (
                                            <p className="text-center py-8 text-gray-400 text-[10px] font-bold uppercase tracking-widest">No attributes linked to selected categories</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabPanel>

                    <TabPanel>
                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 space-y-8 animate-fade-in text-gray-700">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <CustomInput label="Base Price (Market)" name="basePrice" type="number" value={formData.basePrice || 0} onChange={handleGeneralChange} required />
                                <CustomInput label="Sale Price (Platform)" name="salePrice" type="number" value={formData.salePrice || 0} onChange={handleGeneralChange} />
                                <CustomInput label="Discount Percentage (%)" name="discount" type="number" value={formData.discount || 0} onChange={handleGeneralChange} />
                            </div>
                            <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white rounded-2xl text-primary shadow-sm">
                                        <IndianRupee size={24} />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest block">Actual Listing Price</span>
                                        <span className="text-2xl font-black text-primary tracking-tighter">₹ {formData.salePrice || formData.basePrice || 0}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Currency Config</span>
                                    <span className="font-bold text-gray-900">{formData.currency || 'INR'} - Indian Rupee</span>
                                </div>
                            </div>
                        </div>
                    </TabPanel>

                    <TabPanel>
                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 space-y-6 animate-fade-in text-gray-700">
                            <CustomInput label="Main Banner (Hero Image URL)" name="mainImage" value={formData.mainImage || ''} onChange={handleGeneralChange} placeholder="https://..." />
                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Gallery Assets</label>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, images: [...(prev.images || []), ''] }))}
                                        className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                                    >
                                        + Add Asset
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {formData.images?.map((img, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <input
                                                value={img}
                                                onChange={(e) => {
                                                    const newImgs = [...(formData.images || [])];
                                                    newImgs[idx] = e.target.value;
                                                    setFormData(prev => ({ ...prev, images: newImgs }));
                                                }}
                                                className="flex-1 border-2 border-gray-100 bg-gray-50 rounded-2xl py-3 px-4 focus:outline-none focus:border-primary/30 font-bold text-gray-700 text-xs"
                                                placeholder="Asset URL..."
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newImgs = (formData.images || []).filter((_, i) => i !== idx);
                                                    setFormData(prev => ({ ...prev, images: newImgs }));
                                                }}
                                                className="p-3 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-100 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </TabPanel>

                    <TabPanel>
                        {isEdit ? (
                            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 space-y-6 animate-fade-in text-gray-700">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest">Live Variants</h3>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">Found {productSkus.length} Unique SKUs</p>
                                    </div>
                                    <CustomButton
                                        type="button"
                                        onClick={() => navigate('/' + ROUTES.DASHBOARD.SKUS_CREATE + `?productId=${id}`)}
                                        className="rounded-xl h-10 px-4 text-[10px]"
                                    >
                                        <PlusCircle size={14} className="mr-2" /> Architect Variant
                                    </CustomButton>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {productSkus.map(sku => (
                                        <div key={sku._id} className="p-4 rounded-2xl border-2 border-gray-50 bg-gray-50/50 flex items-center justify-between group hover:border-primary/20 transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-primary shadow-sm">
                                                    <Barcode size={20} />
                                                </div>
                                                <div>
                                                    <span className="text-xs font-black text-gray-900 uppercase block">{sku.skuCode}</span>
                                                    <span className="text-[10px] font-bold text-primary">{sku.quantity} in Stock</span>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => navigate('/' + ROUTES.DASHBOARD.SKUS_EDIT.replace(':id', sku._id))}
                                                className="p-2 bg-white text-gray-400 rounded-xl hover:text-primary hover:shadow-md transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    {productSkus.length === 0 && (
                                        <div className="col-span-2 text-center py-12 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
                                            <Box size={32} className="mx-auto mb-2 opacity-10" />
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No variants defined for this product</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="p-12 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-gray-200 animate-fade-in text-gray-700">
                                <PlusCircle size={48} className="mx-auto mb-4 text-primary opacity-20" />
                                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Variant Architecture Blocked</h3>
                                <p className="text-sm text-gray-500 max-w-xs mx-auto mt-2">Finish establishing the core product first to unlock its variant ecosystem.</p>
                            </div>
                        )}
                    </TabPanel>
                </Tabs>

                {error && (
                    <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 text-center font-bold text-sm">
                        {error}
                    </div>
                )}

                <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => navigate(-1)} className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition-all">Discard Changes</button>
                    <CustomButton type="submit" disabled={loading} className="flex-[2] rounded-2xl h-14 shadow-xl shadow-primary/20">
                        <Save size={20} className="mr-2" /> {loading ? 'Processing Transaction...' : isEdit ? 'Publish Refined Product' : 'Establish Product In Catalog'}
                    </CustomButton>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;
