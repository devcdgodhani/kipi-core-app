import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useDispatch } from 'react-redux';
import { Button, Input } from '../../../components/common';
import { productService } from '../../../api/services/product.service';
import { categoryService } from '../../../api/services/category.service';
import { PRODUCT_STATUS, type IProduct, type ICategory, type IAttribute, type ISku } from '../../../types';
import { setLoading } from '../../../Redux/slices/productSlice';
import { Box, Smartphone, X, Truck, Factory, ChevronLeft, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ImageUploader } from '../../../components/common/ImageUploader';
import { Modal } from '../../../components/common';
import { lotService } from '../../../api/services/lot.service';
import { userService } from '../../../api/services/user.service';


const ProductForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const dispatch = useDispatch();
    const isEditMode = !!id;

    const [formData, setFormData] = useState<Partial<IProduct>>({
        name: '',
        slug: '',
        description: '',
        category: '',
        brand: '',
        mrp: 0,
        sellingPrice: 0,
        costPrice: 0,
        status: PRODUCT_STATUS.DRAFT,
        specifications: {},
        sourceType: 'SELF_MANUFACTURE',
        supplierId: '',
        hasLotTracking: false
    });

    const [categoriesList, setCategoriesList] = useState<ICategory[]>([]); // For flat list utilities
    const [categoryAttributes, setCategoryAttributes] = useState<IAttribute[]>([]);
    const [suppliers, setSuppliers] = useState<any[]>([]);

    // Variant Generation State
    const [selectedVariantAttrs, setSelectedVariantAttrs] = useState<string[]>([]);
    const [variantValues, setVariantValues] = useState<Record<string, string[]>>({});
    const [generatedSkus, setGeneratedSkus] = useState<Partial<ISku>[]>([]);
    const [lots, setLots] = useState<any[]>([]);
    const [isLotModalOpen, setIsLotModalOpen] = useState(false);
    const [selectedSkuIndex, setSelectedSkuIndex] = useState<number | null>(null);

    // Helper for tag input
    const [tagInputs, setTagInputs] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await categoryService.getTree();
                const treeData = res.data || [];

                const flatten = (cats: ICategory[]): ICategory[] => {
                    let flat: ICategory[] = [];
                    cats.forEach(c => {
                        flat.push(c);
                        if (c.children) flat = flat.concat(flatten(c.children));
                    });
                    return flat;
                };
                const flatData = flatten(treeData);
                setCategoriesList(flatData);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        };

        const fetchSuppliers = async () => {
            try {
                const res = await userService.getAll({ type: 'SUPPLIER' });
                setSuppliers(Array.isArray(res.data) ? res.data : []);
            } catch (error) {
                console.error('Failed to fetch suppliers');
                setSuppliers([]);
            }
        };


        const fetchLots = async () => {
            try {
                console.log('Fetching lots...');
                const res = await lotService.getAll();
                console.log('Lots API response:', res);
                const lotsList = res.data?.recordList || res.data || [];
                console.log('Extracted lots:', lotsList);
                setLots(lotsList);
            } catch (error) {
                console.error('Failed to fetch lots:', error);
                setLots([]);
            }
        };


        fetchCategories();
        fetchSuppliers();
        fetchLots();
    }, []);

    useEffect(() => {
        if (id) {
            const fetchProduct = async () => {
                dispatch(setLoading(true));
                try {
                    const res = await productService.getById(id);
                    const prod = res.data;
                    if (!prod) throw new Error('Product not found');

                    const normalizedCategory = (typeof prod.category === 'object' && prod.category !== null) ? (prod.category as any)._id : (prod.category || '');
                    console.log('Normalized Category from Product:', normalizedCategory);

                    setFormData({
                        ...prod,
                        category: normalizedCategory,
                        supplierId: prod.supplierId || (prod.supplier ? (typeof prod.supplier === 'object' && prod.supplier !== null ? prod.supplier._id : prod.supplier) : ''),
                        hasLotTracking: prod.hasLotTracking ?? (prod as any).trackByLot ?? false
                    });

                    // Populate variants if needed
                    if (prod.skus && Array.isArray(prod.skus)) {
                        console.log('Raw SKUs from backend:', prod.skus);

                        const skus = prod.skus.map((s: any) => {
                            // Extract lotId - handle both populated and unpopulated cases
                            const extractedLotId = s.lotId
                                ? (typeof s.lotId === 'object' && s.lotId !== null ? s.lotId._id : s.lotId)
                                : '';

                            // Extract attributes - handle both populated and unpopulated cases
                            const extractedAttributes = s.attributes?.map((a: any) => {
                                const attrId = a.attributeId
                                    ? (typeof a.attributeId === 'object' && a.attributeId !== null ? a.attributeId._id : a.attributeId)
                                    : a.attribute;

                                const attrName = a.attributeName
                                    || (typeof a.attributeId === 'object' && a.attributeId !== null ? a.attributeId.name : undefined);

                                return {
                                    attribute: attrId,
                                    value: a.value,
                                    attributeName: attrName
                                };
                            }) || [];

                            console.log('Processed SKU:', {
                                sku: s.sku,
                                lotId: extractedLotId,
                                attributes: extractedAttributes
                            });

                            return {
                                ...s,
                                _id: s._id, // Preserve _id for updates
                                lotId: extractedLotId,
                                attributes: extractedAttributes
                            };
                        });

                        setGeneratedSkus(skus);

                        // Extract selected attributes and values for the generator UI
                        const extractedAttrs = new Set<string>();
                        const extractedValues: Record<string, Set<string>> = {};

                        skus.forEach((sku: any) => {
                            sku.attributes?.forEach((attr: any) => {
                                if (attr.attribute) {
                                    extractedAttrs.add(attr.attribute);
                                    if (!extractedValues[attr.attribute]) {
                                        extractedValues[attr.attribute] = new Set();
                                    }
                                    extractedValues[attr.attribute].add(attr.value);
                                }
                            });
                        });

                        setSelectedVariantAttrs(Array.from(extractedAttrs));
                        const finalValues: Record<string, string[]> = {};
                        Object.keys(extractedValues).forEach(key => {
                            finalValues[key] = Array.from(extractedValues[key]);
                        });
                        setVariantValues(finalValues);

                        console.log('Extracted variant attributes:', Array.from(extractedAttrs));
                        console.log('Extracted variant values:', finalValues);
                    }
                } catch (error) {
                    console.error(error);
                    toast.error('Failed to fetch product');
                } finally {
                    dispatch(setLoading(false));
                }
            };
            fetchProduct();
        }
    }, [id, dispatch]);

    // Fetch Variant Attributes from the Category API
    useEffect(() => {
        const fetchCategoryAttributes = async () => {
            if (!formData.category) {
                console.log('No category selected, skipping attribute fetch');
                setCategoryAttributes([]);
                return;
            }

            try {
                console.log('Fetching attributes for category:', formData.category);
                const res = await categoryService.getById(formData.category as string);
                console.log('Category API response:', res);
                const attrs = (res.data?.attributes || []) as IAttribute[];
                console.log('Extracted attributes:', attrs);
                setCategoryAttributes(attrs);
            } catch (e) {
                console.error('Error fetching attributes from Category API:', e);
                setCategoryAttributes([]);
            }
        };
        fetchCategoryAttributes();
    }, [formData.category]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    const toggleVariantAttribute = (attrId: string) => {
        setSelectedVariantAttrs(prev =>
            prev.includes(attrId) ? prev.filter(id => id !== attrId) : [...prev, attrId]
        );
        if (!variantValues[attrId]) {
            setVariantValues(prev => ({ ...prev, [attrId]: [] }));
        }
    };

    const addVariantValue = (attrId: string, value: string) => {
        if (!value.trim()) return;
        setVariantValues(prev => ({
            ...prev,
            [attrId]: [...(prev[attrId] || []), value.trim()]
        }));
        setTagInputs(prev => ({ ...prev, [attrId]: '' }));
    };

    const removeVariantValue = (attrId: string, index: number) => {
        setVariantValues(prev => ({
            ...prev,
            [attrId]: prev[attrId].filter((_, i) => i !== index)
        }));
    };

    const generateSkus = () => {
        if (selectedVariantAttrs.length === 0) return;

        const arraysToCombine = selectedVariantAttrs.map(attrId => ({
            attrId,
            values: variantValues[attrId] || []
        })).filter(a => a.values.length > 0);

        if (arraysToCombine.length === 0) return;

        const combine = (current: any[], index: number): any[] => {
            if (index === arraysToCombine.length) return [current];
            const res = [];
            for (const val of arraysToCombine[index].values) {
                const attrName = getAttributeName(arraysToCombine[index].attrId);
                const results = combine([...current, { attribute: arraysToCombine[index].attrId, value: val, attributeName: attrName }], index + 1);
                res.push(...results);
            }
            return res;
        };

        const combinations = combine([], 0);

        const newSkus: Partial<ISku>[] = combinations.map(combo => {
            // Check if this combination already exists in generatedSkus
            const existingSku = generatedSkus.find(gs => {
                if (!gs.attributes || gs.attributes.length !== combo.length) return false;
                // Check if all attributes in combo match gs.attributes
                return combo.every((c: any) =>
                    gs.attributes?.some((ga: any) =>
                        (ga.attribute === c.attribute || ga.attributeId === c.attribute) && ga.value === c.value
                    )
                );
            });

            if (existingSku) {
                return existingSku;
            }

            const skuCode = `${formData.slug || 'prod'}-${combo.map((c: any) => c.value).join('-')}`.toLowerCase();
            return {
                sku: skuCode,
                mrp: formData.mrp || 0,
                sellingPrice: formData.sellingPrice || 0,
                costPrice: formData.costPrice || 0,
                stock: 0,
                attributes: combo,
                images: []
            };
        });

        setGeneratedSkus(newSkus);
        toast.success(`Generated ${newSkus.length} SKUs`);
    };

    const updateSkuField = (index: number, field: keyof ISku, value: any) => {
        setGeneratedSkus(prev => prev.map((sku, i) => i === index ? { ...sku, [field]: value } : sku));
    };

    const removeSku = (index: number) => {
        setGeneratedSkus(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(setLoading(true));
        try {
            const payload = {
                ...formData,
                variants: generatedSkus.length > 0 ? generatedSkus.map(s => ({
                    ...s,
                    attributes: s.attributes?.map((a: any) => ({
                        attributeId: a.attribute || a.attributeId,
                        value: a.value,
                        attributeName: getAttributeName(a.attribute || a.attributeId, a.attributeName)
                    }))
                })) : undefined
            };

            if (isEditMode && id) {
                await productService.update(id, payload);
                toast.success('Product updated successfully');
            } else {
                await productService.create(payload);
                toast.success('Product created successfully');
            }
            navigate('/products');
        } catch (error) {
            console.error(error);
            toast.error('Failed to save product');
        } finally {
            dispatch(setLoading(false));
        }
    };

    const getAttributeName = (id: string, fallback?: string) => {
        const attr = categoryAttributes?.find(a => a._id === id);
        return attr?.name || fallback || id;
    };

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6 pb-20">
            <div className="flex items-center gap-4">
                <Button variant="ghost" className="!p-2" onClick={() => navigate('/products')}>
                    <ChevronLeft />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">
                        {isEditMode ? 'Edit Product' : 'Create New Product'}
                    </h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Basic Info */}
                <div className="bg-surface border border-border p-6 rounded-xl space-y-6">
                    <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                        <Box size={20} className="text-brand-500" /> Basic Information
                    </h2>

                    <div className="grid grid-cols-2 gap-6">
                        <Input
                            label="Product Name"
                            name="name"
                            value={formData.name || ''}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="Slug"
                            name="slug"
                            value={formData.slug || ''}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1.5 w-full">
                            <label className="text-xs font-black uppercase tracking-widest text-text-secondary ml-1">
                                Category
                            </label>
                            <select
                                name="category"
                                value={(formData as any).category || ''}
                                onChange={handleChange}
                                required
                                className="w-full bg-surface border border-border rounded-2xl text-sm text-text-primary px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/30 transition-all duration-200"
                            >
                                <option value="">Select Category</option>
                                <option value="" disabled>─</option>
                                {categoriesList?.map(cat => (
                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                ))}
                            </select>
                            <p className="text-[10px] text-text-secondary mt-1 italic">Used for variant attributes.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <Input
                            label="Brand"
                            name="brand"
                            value={formData.brand || ''}
                            onChange={handleChange}
                        />
                        <div className="space-y-1.5 w-full">
                            <label className="text-xs font-black uppercase tracking-widest text-text-secondary ml-1">
                                Status
                            </label>
                            <select
                                name="status"
                                value={formData.status || PRODUCT_STATUS.DRAFT}
                                onChange={handleChange}
                                className="w-full bg-surface border border-border rounded-2xl text-sm text-text-primary px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/30 transition-all duration-200"
                            >
                                {Object.values(PRODUCT_STATUS).map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                        <Input
                            label="MRP"
                            name="mrp"
                            type="number"
                            value={formData.mrp || 0}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="Selling Price"
                            name="sellingPrice"
                            type="number"
                            value={formData.sellingPrice || 0}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="Cost Price"
                            name="costPrice"
                            type="number"
                            value={formData.costPrice || 0}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-1.5 w-full">
                        <label className="text-xs font-black uppercase tracking-widest text-text-secondary ml-1">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description || ''}
                            onChange={handleChange}
                            className="w-full bg-surface border border-border rounded-2xl text-sm text-text-primary px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/30 transition-all duration-200 min-h-[100px]"
                        />
                    </div>
                </div>

                <div className="space-y-1.5 w-full">
                    <label className="text-xs font-black uppercase tracking-widest text-text-secondary ml-1">
                        Product Images
                    </label>
                    <ImageUploader
                        images={formData.images || []}
                        onChange={(newImages) => setFormData(prev => ({ ...prev, images: newImages }))}
                    />
                </div>

                {/* Sourcing & Logistics */}
                <div className="bg-surface border border-border p-6 rounded-xl space-y-6">
                    <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                        <Truck size={20} className="text-blue-500" /> Sourcing & Logistics
                    </h2>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1.5 w-full">
                            <label className="text-xs font-black uppercase tracking-widest text-text-secondary ml-1">
                                Product Source
                            </label>
                            <div className="flex gap-4 pt-2">
                                <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${formData.sourceType === 'SELF_MANUFACTURE' ? 'border-brand-500 bg-brand-500/10 text-brand-500' : 'border-border bg-surface-hover text-text-secondary hover:bg-surface-hover/80'}`}>
                                    <input
                                        type="radio"
                                        name="sourceType"
                                        value="SELF_MANUFACTURE"
                                        checked={formData.sourceType === 'SELF_MANUFACTURE'}
                                        onChange={handleChange}
                                        className="hidden"
                                    />
                                    <Factory size={18} />
                                    <span className="font-bold text-sm">Self Manufacture</span>
                                </label>
                                <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${formData.sourceType === 'SUPPLIER' ? 'border-blue-500 bg-blue-500/10 text-blue-500' : 'border-border bg-surface-hover text-text-secondary hover:bg-surface-hover/80'}`}>
                                    <input
                                        type="radio"
                                        name="sourceType"
                                        value="SUPPLIER"
                                        checked={formData.sourceType === 'SUPPLIER'}
                                        onChange={handleChange}
                                        className="hidden"
                                    />
                                    <Truck size={18} />
                                    <span className="font-bold text-sm">From Supplier</span>
                                </label>
                            </div>
                        </div>

                        {formData.sourceType === 'SUPPLIER' && (
                            <div className="space-y-1.5 w-full">
                                <label className="text-xs font-black uppercase tracking-widest text-text-secondary ml-1">
                                    Supplier
                                </label>
                                <select
                                    name="supplierId"
                                    value={(formData as any).supplierId || ''}
                                    onChange={handleChange}
                                    className="w-full bg-surface border border-border rounded-2xl text-sm text-text-primary px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/30 transition-all duration-200"
                                >
                                    <option value="">Select Supplier</option>
                                    {Array.isArray(suppliers) && suppliers.map(sup => (
                                        <option key={sup._id} value={sup._id}>{sup.firstName} {sup.lastName}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-surface-hover rounded-lg border border-border">
                        <input
                            type="checkbox"
                            checked={formData.hasLotTracking || false}
                            name="hasLotTracking"
                            onChange={handleCheckboxChange}
                            className="w-5 h-5 rounded border-border bg-surface text-brand-500 focus:ring-brand-500"
                        />
                        <div>
                            <p className="text-sm font-bold text-text-primary">Enable Lot Tracking</p>
                            <p className="text-xs text-text-secondary">Track inventory by batches (lots) with expiry dates and QC status.</p>
                        </div>
                    </div>
                </div>

                {/* Variants & SKUs */}
                <div className="bg-surface border border-border p-6 rounded-xl space-y-6">
                    <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                        <Smartphone size={20} className="text-brand-500" /> Variants & SKUs
                    </h2>

                    {(!categoryAttributes || categoryAttributes.length === 0) ? (
                        <p className="text-text-secondary text-sm italic">Select a category with attributes to generate variants.</p>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-xs text-text-secondary uppercase tracking-wider">Select Attributes to create variants from:</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {categoryAttributes.map(attr => (
                                    <div key={attr._id} className="p-4 bg-surface-hover/30 rounded-lg border border-border transition-all hover:border-text-secondary/20">
                                        <div className="flex items-center gap-3 mb-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedVariantAttrs.includes(attr._id)}
                                                onChange={() => toggleVariantAttribute(attr._id)}
                                                className="w-4 h-4 rounded bg-surface border-border text-brand-500 focus:ring-brand-500"
                                            />
                                            <span className="font-bold text-text-primary text-sm">{attr.name}</span>
                                        </div>

                                        {selectedVariantAttrs.includes(attr._id) && (
                                            <div className="pl-7 space-y-3">
                                                <div className="flex gap-2">
                                                    <Input
                                                        className="!py-1.5 !text-xs"
                                                        placeholder="Type value & hit Enter"
                                                        value={tagInputs[attr._id] || ''}
                                                        onChange={(e) => setTagInputs(p => ({ ...p, [attr._id]: e.target.value }))}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                addVariantValue(attr._id, tagInputs[attr._id]);
                                                            }
                                                        }}
                                                    />
                                                    <Button type="button" size="sm" onClick={() => addVariantValue(attr._id, tagInputs[attr._id] || '')}>
                                                        Add
                                                    </Button>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {variantValues[attr._id]?.map((val, idx) => (
                                                        <span key={idx} className="bg-brand-500/10 border border-brand-500/20 text-brand-500 text-[10px] px-2 py-1 rounded-md flex items-center gap-1.5 font-medium">
                                                            {val}
                                                            <button type="button" onClick={() => removeVariantValue(attr._id, idx)} className="hover:text-red-400">
                                                                <X size={10} />
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>

                                                {attr.options && attr.options.length > 0 && (
                                                    <div className="space-y-1.5 pt-1">
                                                        <p className="text-[10px] text-text-secondary uppercase tracking-tight">Available Options:</p>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {attr.options.map((opt, oIdx) => (
                                                                <button
                                                                    key={oIdx}
                                                                    type="button"
                                                                    disabled={variantValues[attr._id]?.includes(opt)}
                                                                    onClick={() => addVariantValue(attr._id, opt)}
                                                                    className={`text-[10px] px-2 py-1 rounded border transition-all ${variantValues[attr._id]?.includes(opt)
                                                                        ? 'bg-surface-hover border-border text-text-secondary cursor-not-allowed'
                                                                        : 'bg-surface border-border text-text-secondary hover:border-brand-500/30 hover:text-brand-500'
                                                                        }`}
                                                                >
                                                                    {opt}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end pt-2">
                                <Button type="button" onClick={generateSkus} disabled={selectedVariantAttrs.length === 0}>
                                    Generate SKUs
                                </Button>
                            </div>
                        </div>
                    )}

                    {(generatedSkus && generatedSkus.length > 0) && (
                        <div className="space-y-4 pt-4 border-t border-border">
                            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Configured SKUs</h3>
                            <div className="overflow-x-auto border border-border rounded-xl">
                                <table className="w-full text-left text-sm text-text-secondary">
                                    <thead className="bg-surface-hover/50 text-text-primary uppercase font-bold text-xs">
                                        <tr>
                                            <th className="px-4 py-3">SKU Code</th>
                                            <th className="px-4 py-3">Attributes</th>
                                            <th className="px-4 py-3 w-28">MRP</th>
                                            <th className="px-4 py-3 w-28">Selling</th>
                                            <th className="px-4 py-3 w-28">Cost</th>
                                            <th className="px-4 py-3 w-28">Stock</th>
                                            <th className="px-4 py-3 w-48">Lot</th>
                                            <th className="px-4 py-3 w-20 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {generatedSkus.map((sku, index) => (
                                            <tr key={index} className="hover:bg-surface-hover transition-colors">
                                                <td className="px-4 py-3 font-mono text-xs text-text-primary">
                                                    <input
                                                        value={sku.sku || ''}
                                                        onChange={(e) => updateSkuField(index, 'sku', e.target.value)}
                                                        className="bg-transparent border-b border-transparent focus:border-brand-500 outline-none w-full transition-colors"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-wrap gap-1">
                                                        {(() => {
                                                            console.log(`SKU ${index} attributes:`, sku.attributes);
                                                            return sku.attributes?.map((a: any, attrIdx: number) => (
                                                                <span key={attrIdx} className="px-1.5 py-0.5 rounded bg-surface border border-border text-[9px] whitespace-nowrap text-text-secondary">
                                                                    {getAttributeName(a.attribute, a.attributeName)}: <span className="text-text-primary font-bold">{a.value}</span>
                                                                </span>
                                                            ));
                                                        })()}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="number"
                                                        value={sku.mrp || 0}
                                                        onChange={(e) => updateSkuField(index, 'mrp', Number(e.target.value))}
                                                        className="bg-surface border border-border rounded px-2 py-1 w-full text-text-primary text-[10px] focus:ring-1 focus:ring-brand-500 outline-none"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="number"
                                                        value={sku.sellingPrice || 0}
                                                        onChange={(e) => updateSkuField(index, 'sellingPrice', Number(e.target.value))}
                                                        className="bg-surface border border-border rounded px-2 py-1 w-full text-text-primary text-[10px] focus:ring-1 focus:ring-brand-500 outline-none"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="number"
                                                        value={sku.costPrice || 0}
                                                        onChange={(e) => updateSkuField(index, 'costPrice', Number(e.target.value))}
                                                        className="bg-surface border border-border rounded px-2 py-1 w-full text-text-primary text-[10px] focus:ring-1 focus:ring-brand-500 outline-none"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <input
                                                        type="number"
                                                        value={sku.stock || 0}
                                                        onChange={(e) => updateSkuField(index, 'stock', Number(e.target.value))}
                                                        className="bg-surface border border-border rounded px-2 py-1 w-full text-text-primary text-[10px] focus:ring-1 focus:ring-brand-500 outline-none"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-1 items-center">
                                                        <select
                                                            value={sku.lotId ? String(sku.lotId) : ''}
                                                            onChange={(e) => {
                                                                if (e.target.value === 'new') {
                                                                    setSelectedSkuIndex(index);
                                                                    setIsLotModalOpen(true);
                                                                } else {
                                                                    updateSkuField(index, 'lotId', e.target.value);
                                                                }
                                                            }}
                                                            className="bg-surface border border-border rounded px-2 py-1 w-full text-text-primary text-[10px] focus:ring-1 focus:ring-brand-500 outline-none"
                                                        >
                                                            <option value="">No Lot</option>
                                                            <optgroup label="Actions">
                                                                <option value="new">+ Create New Lot</option>
                                                            </optgroup>
                                                            <optgroup label="Available Lots">
                                                                {lots.map(lot => (
                                                                    <option key={lot._id} value={lot._id}>
                                                                        {lot.lotNumber} ({lot.currentQuantity} units)
                                                                    </option>
                                                                ))}
                                                            </optgroup>
                                                        </select>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button type="button" onClick={() => removeSku(index)} className="text-text-secondary hover:text-red-500 transition-colors">
                                                        <X size={16} />
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

                <div className="pt-4 flex justify-end">
                    <Button type="submit" size="lg" className="w-full md:w-auto shadow-lg shadow-brand-500/20">
                        {isEditMode ? 'Update Product' : 'Create Product'}
                    </Button>
                </div>
            </form>

            <LotCreateModal
                isOpen={isLotModalOpen}
                onClose={() => setIsLotModalOpen(false)}
                onCreated={(newLot) => {
                    setLots(prev => [newLot, ...prev]);
                    if (selectedSkuIndex !== null) {
                        updateSkuField(selectedSkuIndex, 'lotId', newLot._id);
                    }
                }}
                suppliers={suppliers}
            />
        </div>
    );
};

const LotCreateModal = ({ isOpen, onClose, onCreated, suppliers }: {
    isOpen: boolean;
    onClose: () => void;
    onCreated: (lot: any) => void;
    suppliers: any[];
}) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        lotNumber: '',
        sourceType: 'SELF_MANUFACTURE',
        supplierId: '',
        initialQuantity: 0,
        costPerUnit: 0,
        manufacturingDate: '',
        expiryDate: '',
        qualityCheckStatus: 'PENDING',
        notes: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await lotService.create({
                ...formData,
                currentQuantity: formData.initialQuantity,
                sku: '' // Initially empty as per requirement
            } as any);
            toast.success('Lot created successfully');
            onCreated(res.data);
            onClose();
            // Reset form
            setFormData({
                lotNumber: '',
                sourceType: 'SELF_MANUFACTURE',
                supplierId: '',
                initialQuantity: 0,
                costPerUnit: 0,
                manufacturingDate: '',
                expiryDate: '',
                qualityCheckStatus: 'PENDING',
                notes: ''
            });
        } catch (error) {
            console.error(error);
            toast.error('Failed to create lot');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Batch/Lot">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Lot Number"
                        value={formData.lotNumber}
                        onChange={e => setFormData(p => ({ ...p, lotNumber: e.target.value }))}
                        placeholder="e.g. BATCH-001"
                        required
                    />
                    <div className="space-y-1">
                        <label className="text-xs font-black uppercase text-text-secondary ml-1">Source</label>
                        <select
                            value={formData.sourceType}
                            onChange={e => setFormData(p => ({ ...p, sourceType: e.target.value }))}
                            className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-sm text-text-primary"
                        >
                            <option value="SELF_MANUFACTURE">Self Manufacture</option>
                            <option value="SUPPLIER">From Supplier</option>
                        </select>
                    </div>
                </div>

                {formData.sourceType === 'SUPPLIER' && (
                    <div className="space-y-1">
                        <label className="text-xs font-black uppercase text-text-secondary ml-1">Supplier</label>
                        <select
                            value={formData.supplierId}
                            onChange={e => setFormData(p => ({ ...p, supplierId: e.target.value }))}
                            className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-sm text-text-primary"
                            required
                        >
                            <option value="">Select Supplier</option>
                            {suppliers.map(sup => (
                                <option key={sup._id} value={sup._id}>{sup.firstName} {sup.lastName}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Quantity"
                        type="number"
                        value={formData.initialQuantity}
                        onChange={e => setFormData(p => ({ ...p, initialQuantity: Number(e.target.value) }))}
                        required
                    />
                    <Input
                        label="Cost Per Unit"
                        type="number"
                        step="0.01"
                        value={formData.costPerUnit}
                        onChange={e => setFormData(p => ({ ...p, costPerUnit: Number(e.target.value) }))}
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Mfg Date"
                        type="date"
                        value={formData.manufacturingDate}
                        onChange={e => setFormData(p => ({ ...p, manufacturingDate: e.target.value }))}
                    />
                    <Input
                        label="Expiry Date"
                        type="date"
                        value={formData.expiryDate}
                        onChange={e => setFormData(p => ({ ...p, expiryDate: e.target.value }))}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <Button variant="secondary" onClick={onClose} type="button">Cancel</Button>
                    <Button type="submit" disabled={loading} className="gap-2">
                        <Plus size={18} /> {loading ? 'Creating...' : 'Create Lot'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default ProductForm;
