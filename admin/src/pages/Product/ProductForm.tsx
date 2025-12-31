import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ChevronLeft,
    Save,
    Image as ImageIcon,
    Tag,
    IndianRupee,
    Settings,
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
    const [categoryTree, setCategoryTree] = useState<ICategory[]>([]);
    const [relevantAttributes, setRelevantAttributes] = useState<IAttribute[]>([]);
    const [variantAttributes, setVariantAttributes] = useState<IAttribute[]>([]);
    const [variantConfig, setVariantConfig] = useState<Record<string, string[]>>({});
    const [generatedSkus, setGeneratedSkus] = useState<any[]>([]);
    const [productSkus, setProductSkus] = useState<ISku[]>([]);

    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const flattenCategories = (cats: ICategory[]): ICategory[] => {
        let flat: ICategory[] = [];
        cats.forEach(cat => {
            flat.push(cat);
            if (cat.children && cat.children.length > 0) {
                flat = [...flat, ...flattenCategories(cat.children)];
            }
        });
        return flat;
    };

    const fetchInitialData = useCallback(async () => {
        setPageLoading(true);
        try {
            const catRes = await categoryService.getAll({ isTree: true });
            if (catRes?.data) {
                setCategoryTree(catRes.data);
                setAllCategories(flattenCategories(catRes.data));
            }

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
            if (categoryIds.length === 0 || allCategories.length === 0) {
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
                    if (attrRes?.data) {
                        setRelevantAttributes(attrRes.data);
                        setVariantAttributes(attrRes.data.filter((a: any) => a.isVariant));
                    }
                } else {
                    setRelevantAttributes([]);
                    setVariantAttributes([]);
                }
            } catch (err) {
                console.error('Failed to fetch relevant attributes', err);
            }
        };

        fetchAttributes();
    }, [formData.categoryIds, allCategories]);

    const generateSkusLocally = () => {
        const variants = variantAttributes.filter(attr => variantConfig[attr._id]?.length > 0);
        if (variants.length === 0) {
            alert('Please select at least one value for variant attributes');
            return;
        }

        const optionSets = variants.map(v => variantConfig[v._id]);
        const combinations = combinationsFlat(optionSets);

        const newSkus = combinations.map((combo) => {
            const attrs = Array.isArray(combo) ? combo : [combo];
            const variantAttributesData = variants.map((v, idx) => ({
                attributeId: v._id,
                value: attrs[idx]
            }));

            const skuCode = `${formData.name?.substring(0, 3).toUpperCase()}-${attrs.join('-').toUpperCase()}-${Math.floor(Math.random() * 1000)}`;

            return {
                skuCode,
                price: formData.salePrice || formData.basePrice || 0,
                quantity: 0,
                variantAttributes: variantAttributesData,
                status: 'ACTIVE'
            };
        });

        setGeneratedSkus(newSkus);
    };

    function combinationsFlat(arrays: any[][]) {
        if (arrays.length === 0) return [];
        if (arrays.length === 1) return arrays[0].map(item => [item]);

        let result: any[][] = [[]];
        for (const array of arrays) {
            const temp: any[][] = [];
            for (const x of result) {
                for (const y of array) {
                    temp.push([...x, y]);
                }
            }
            result = temp;
        }
        return result;
    }

    const handleGeneratedSkuChange = (index: number, field: string, value: any) => {
        const updated = [...generatedSkus];
        updated[index] = { ...updated[index], [field]: value };
        setGeneratedSkus(updated);
    };

    const handleVariantConfigToggle = (attrId: string, value: string) => {
        setVariantConfig(prev => {
            const current = prev[attrId] || [];
            const exists = current.includes(value);
            return {
                ...prev,
                [attrId]: exists ? current.filter(v => v !== value) : [...current, value]
            };
        });
    };

    const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'basePrice' || name === 'salePrice' || name === 'discount' ? Number(value) : value
        }));
    };

    const getParentIds = (cats: ICategory[], targetId: string, parents: string[] = []): string[] | null => {
        for (const cat of cats) {
            if (cat._id === targetId) return parents;
            if (cat.children) {
                const found = getParentIds(cat.children, targetId, [...parents, cat._id]);
                if (found) return found;
            }
        }
        return null;
    };

    const handleCategoryToggle = (catId: string) => {
        setFormData(prev => {
            const current = (prev.categoryIds as string[]) || [];
            const isRemoving = current.includes(catId);

            let nextIds = isRemoving ? current.filter(id => id !== catId) : [...current, catId];

            // If adding a child, auto-select all its parents
            if (!isRemoving) {
                const parents = getParentIds(categoryTree, catId) || [];
                nextIds = Array.from(new Set([...nextIds, ...parents]));
            }

            return {
                ...prev,
                categoryIds: nextIds
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

    const CategoryTreeItem: React.FC<{ cat: ICategory; level: number }> = ({ cat, level }) => {
        const categoryIds = (formData.categoryIds || []) as string[];
        const isSelected = categoryIds.includes(cat._id);

        return (
            <div className="space-y-1">
                <div
                    onClick={() => handleCategoryToggle(cat._id)}
                    style={{ paddingLeft: `${level * 1.5 + 1}rem` }}
                    className={`flex items-center gap-3 py-2 px-4 cursor-pointer transition-all rounded-xl border-2 ${isSelected ? 'bg-primary/5 border-primary text-primary' : 'hover:bg-gray-50 border-transparent text-gray-600'
                        }`}
                >
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-primary border-primary' : 'border-gray-300'}`}>
                        {isSelected && <CheckCircle2 size={10} className="text-white" />}
                    </div>
                    <span className={`text-[11px] font-mono tracking-tight ${isSelected ? 'font-black' : 'font-bold'}`}>{cat.name}</span>
                </div>
                {cat.children && cat.children.length > 0 && (
                    <div className="space-y-1">
                        {cat.children.map(child => <CategoryTreeItem key={child._id} cat={child} level={level + 1} />)}
                    </div>
                )}
            </div>
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const submitData = {
                ...formData,
                skus: generatedSkus.length > 0 ? generatedSkus : productSkus
            };

            if (isEdit) {
                await productService.update(id!, submitData);
                setSuccess('Product architecture updated successfully!');
            } else {
                const res = await productService.create(submitData);
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
                            <IndianRupee size={16} /> Pricing Hub
                        </Tab>
                        <Tab className="flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-[1.5rem] cursor-pointer transition-all font-black text-[10px] uppercase tracking-widest outline-none border-none text-gray-400 aria-selected:bg-white aria-selected:text-primary aria-selected:shadow-xl aria-selected:shadow-gray-200 min-w-[150px]">
                            <ImageIcon size={16} /> Media Assets
                        </Tab>
                        <Tab className="flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-[1.5rem] cursor-pointer transition-all font-black text-[10px] uppercase tracking-widest outline-none border-none text-gray-400 aria-selected:bg-white aria-selected:text-primary aria-selected:shadow-xl aria-selected:shadow-gray-200 min-w-[150px]">
                            <Barcode size={16} /> SKUs & Config
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
                            <div className="flex flex-col gap-4">
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

                            <div className="space-y-4 pt-4 mt-4 border-t border-gray-100">
                                <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest flex items-center gap-2">
                                    <Tag size={16} className="text-primary" /> Core Taxonomy
                                </h3>
                                <div className="bg-gray-50/50 rounded-[2rem] border-2 border-gray-100 p-6 max-h-[400px] overflow-y-auto custom-scrollbar">
                                    {categoryTree.length === 0 && (
                                        <div className="text-center py-8 text-gray-400 font-bold uppercase text-[10px]">
                                            No categories initialized
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        {categoryTree.map(cat => <CategoryTreeItem key={cat._id} cat={cat} level={0} />)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabPanel>

                    <TabPanel>
                        <div className="animate-fade-in text-gray-700 space-y-8">
                            {/* Section 1: Product Specifications (Non-variant) */}
                            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest flex items-center gap-2">
                                        <Settings size={16} className="text-primary" /> Product Specifications
                                    </h3>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Static attributes for all variants</span>
                                </div>
                                {((formData.categoryIds || []) as string[]).length === 0 ? (
                                    <div className="text-center py-8 text-gray-400">
                                        <p className="text-[10px] font-bold uppercase tracking-widest">Select target categories under 'Basic Details'</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {relevantAttributes.filter(a => !a.isVariant).map(attr => {
                                            const valObj = formData.attributes?.find(a => (typeof a.attributeId === 'object' ? (a.attributeId as any)._id : a.attributeId) === attr._id);
                                            return (
                                                <div key={attr._id} className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{attr.name}</label>
                                                    {attr.inputType === 'DROPDOWN' || attr.valueType === 'SELECT' ? (
                                                        <select
                                                            value={valObj?.value || ''}
                                                            onChange={(e) => handleAttributeValueChange(attr._id, e.target.value)}
                                                            className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl py-3 px-4 focus:outline-none focus:border-primary/30 font-bold text-gray-700 text-xs"
                                                        >
                                                            <option value="">Select</option>
                                                            {attr.options?.map(o => (
                                                                <option key={o.value} value={o.value}>{o.label}</option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            value={valObj?.value || ''}
                                                            onChange={(e) => handleAttributeValueChange(attr._id, e.target.value)}
                                                            className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl py-3 px-4 focus:outline-none focus:border-primary/30 font-bold text-gray-700 text-xs"
                                                            placeholder={`Value...`}
                                                        />
                                                    )}
                                                </div>
                                            );
                                        })}
                                        {relevantAttributes.filter(a => !a.isVariant).length === 0 && (
                                            <div className="col-span-3 py-6 text-center text-gray-400 text-[10px] font-bold uppercase">No specification attributes found</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Section 2: Variant Generation Ecosystem */}
                            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 space-y-8">
                                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-50">
                                    <div>
                                        <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest">SKU Architecture Engine</h3>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">Configure variant permutations</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <CustomButton type="button" onClick={generateSkusLocally} className="rounded-xl h-10 px-6 text-[10px]">
                                            <PlusCircle size={14} className="mr-2" /> Build Local SKUs
                                        </CustomButton>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {variantAttributes.map(attr => (
                                        <div key={attr._id} className="space-y-4">
                                            <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
                                                <input type="checkbox" className="w-4 h-4 rounded text-primary focus:ring-primary" checked={!!variantConfig[attr._id]} onChange={(e) => {
                                                    if (e.target.checked) setVariantConfig(p => ({ ...p, [attr._id]: [] }));
                                                    else setVariantConfig(p => { const next = { ...p }; delete next[attr._id]; return next; });
                                                }} />
                                                <label className="text-[10px] font-black text-gray-900 uppercase tracking-widest leading-none pt-0.5">{attr.name}</label>
                                            </div>
                                            {variantConfig[attr._id] && (
                                                <div className="flex flex-wrap gap-2">
                                                    {attr.options?.map(opt => {
                                                        const isSelected = variantConfig[attr._id].includes(opt.value);
                                                        return (
                                                            <button
                                                                key={opt.value}
                                                                type="button"
                                                                onClick={() => handleVariantConfigToggle(attr._id, opt.value)}
                                                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all border-2 ${isSelected
                                                                    ? 'bg-primary border-primary text-white shadow-md'
                                                                    : 'bg-white border-gray-100 text-gray-500 hover:border-primary/20 hover:text-primary'
                                                                    }`}
                                                            >
                                                                {opt.label}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {variantAttributes.length === 0 && (
                                        <div className="col-span-3 py-8 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 italic">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No variant configurations available for selection</p>
                                        </div>
                                    )}
                                </div>

                                {generatedSkus.length > 0 && (
                                    <div className="mt-8 space-y-4 pt-8 border-t border-gray-50">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.3em]">Locally Prepared SKUs ({generatedSkus.length})</h4>
                                            <button type="button" onClick={() => setGeneratedSkus([])} className="text-[10px] font-bold text-rose-500 hover:underline uppercase tracking-widest">Wipe Local Storage</button>
                                        </div>
                                        <div className="overflow-x-auto rounded-[1.5rem] border border-gray-100 shadow-sm">
                                            <table className="w-full text-left text-[11px]">
                                                <thead className="bg-gray-50/80 backdrop-blur-sm border-b border-gray-100 uppercase tracking-wider text-gray-400 font-black">
                                                    <tr>
                                                        <th className="px-6 py-4">SKU Identity</th>
                                                        <th className="px-6 py-4 text-center">Price Point (₹)</th>
                                                        <th className="px-6 py-4 text-center">Initial Inventory</th>
                                                        <th className="px-6 py-4 text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50 bg-white">
                                                    {generatedSkus.map((sku, idx) => (
                                                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                                            <td className="px-6 py-4">
                                                                <span className="font-mono font-black text-primary bg-primary/5 px-2 py-1 rounded text-[10px]">{sku.skuCode}</span>
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <input
                                                                    type="number"
                                                                    value={sku.price}
                                                                    onChange={(e) => handleGeneratedSkuChange(idx, 'price', Number(e.target.value))}
                                                                    className="w-24 bg-gray-50 border-2 border-transparent rounded-xl px-3 py-2 focus:bg-white focus:border-primary/20 text-center font-black text-gray-700 transition-all outline-none"
                                                                />
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <input
                                                                    type="number"
                                                                    value={sku.quantity}
                                                                    onChange={(e) => handleGeneratedSkuChange(idx, 'quantity', Number(e.target.value))}
                                                                    className="w-24 bg-gray-50 border-2 border-transparent rounded-xl px-3 py-2 focus:bg-white focus:border-primary/20 text-center font-black text-gray-700 transition-all outline-none"
                                                                />
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setGeneratedSkus(prev => prev.filter((_, i) => i !== idx))}
                                                                    className="p-2 text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Section 3: Live SKUs (For Edit Mode) */}
                            {isEdit && productSkus.length > 0 && (
                                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest">Authenticated Variants</h3>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">Live in Master Catalog</p>
                                        </div>
                                        <CustomButton type="button" onClick={() => navigate('/' + ROUTES.DASHBOARD.SKUS_CREATE + `?productId=${id}`)} className="rounded-xl h-10 px-4 text-[10px]">
                                            <PlusCircle size={14} className="mr-2" /> Direct Architecture
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
                                                <button type="button" onClick={() => navigate('/' + ROUTES.DASHBOARD.SKUS_EDIT.replace(':id', sku._id))} className="p-2 bg-white text-gray-400 rounded-xl hover:text-primary hover:shadow-md transition-all opacity-0 group-hover:opacity-100 shadow-sm">
                                                    <Edit2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
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
