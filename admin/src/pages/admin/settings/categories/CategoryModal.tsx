import React, { useState, useEffect } from 'react';
import { Modal, Input, Button } from '../../../../components/common';
import type { ICategory, IAttribute } from '../../../../types';
import { categoryService } from '../../../../api/services/category.service';
import { attributeService } from '../../../../api/services/attribute.service';
import { useDispatch } from 'react-redux';
import { setCategoryTree, setLoading, setError } from '../../../../Redux/slices/categorySlice';


interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    category: ICategory | null;
    parentCategory: ICategory | null; // If creating a sub-category
    categories: ICategory[]; // Full tree for parent selection (we might need to flatten this)
}

const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, category, parentCategory, categories }) => {
    const dispatch = useDispatch();
    const [formData, setFormData] = useState<Partial<ICategory>>({
        name: '',
        slug: '',
        parentId: '',
        attributes: [],
        isActive: true,
    });

    const [availableAttributes, setAvailableAttributes] = useState<IAttribute[]>([]);
    const [flatCategories, setFlatCategories] = useState<ICategory[]>([]);

    // Helper to flatten category tree for dropdown
    const flattenCategories = (cats: ICategory[], depth = 0): ICategory[] => {
        let flat: ICategory[] = [];
        cats.forEach(cat => {
            flat.push({ ...cat, name: '-'.repeat(depth) + ' ' + cat.name });
            if (cat.children && cat.children.length > 0) {
                flat = flat.concat(flattenCategories(cat.children, depth + 1));
            }
        });
        return flat;
    };

    useEffect(() => {
        const fetchAttributes = async () => {
            try {
                const res = await attributeService.getAllNoPagination();
                setAvailableAttributes(res.data || []);
            } catch (e) {
                console.error(e);
            }
        };
        if (isOpen) fetchAttributes();
    }, [isOpen]);

    useEffect(() => {
        setFlatCategories(flattenCategories(categories));
    }, [categories]);

    useEffect(() => {
        if (category) {
            setFormData({
                ...category,
                attributes: (category.attributes as IAttribute[] || []).map(a => typeof a === 'string' ? a : a._id)
            });
        } else {
            setFormData({
                name: '',
                slug: '',
                parentId: parentCategory ? parentCategory._id : '',
                attributes: [],
                isActive: true,
            });
        }
    }, [category, parentCategory, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAttributeToggle = (attrId: string) => {
        setFormData(prev => {
            const current = (prev.attributes as string[]) || [];
            if (current.includes(attrId)) {
                return { ...prev, attributes: current.filter(id => id !== attrId) };
            } else {
                return { ...prev, attributes: [...current, attrId] };
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(setLoading(true));

        try {
            if (category) {
                await categoryService.update(category._id, formData);
            } else {
                await categoryService.create(formData);
            }

            // Refresh tree
            const res = await categoryService.getTree();
            dispatch(setCategoryTree(res.data));

            onClose();
        } catch (error: any) {
            dispatch(setError(error.response?.data?.message || 'Something went wrong'));
        } finally {
            dispatch(setLoading(false));
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={category ? 'Edit Category' : 'Create Category'}
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Category Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Smart Phones"
                />

                <Input
                    label="Slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    required
                    placeholder="e.g. smart-phones"
                />

                <div className="space-y-1.5 w-full">
                    <label className="text-xs font-black uppercase tracking-widest text-text-secondary ml-1">
                        Parent Category
                    </label>
                    <select
                        name="parentId"
                        value={formData.parentId || ''}
                        onChange={handleChange}
                        className="w-full bg-surface border border-border rounded-2xl text-sm text-text-primary px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/30 transition-all duration-200"
                    >
                        <option value="">None (Top Level)</option>
                        {flatCategories.map(cat => (
                            <option key={cat._id} value={cat._id} disabled={category ? cat._id === category._id : false}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2 p-4 bg-surface rounded-xl border border-border">
                    <label className="text-xs font-black uppercase tracking-widest text-text-secondary ml-1">
                        Associated Attributes
                    </label>
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto custom-scrollbar">
                        {availableAttributes.map(attr => (
                            <button
                                key={attr._id}
                                type="button"
                                onClick={() => handleAttributeToggle(attr._id)}
                                className={`px-3 py-1.5 rounded-full text-xs transition-colors border ${(formData.attributes as string[])?.includes(attr._id)
                                    ? 'bg-brand-500 text-white border-brand-500'
                                    : 'bg-surface-hover text-text-secondary border-border hover:border-text-secondary'
                                    }`}
                            >
                                {attr.name}
                            </button>
                        ))}
                    </div>
                    <p className="text-[10px] text-text-secondary ml-1">
                        Products in this category will inherit these attributes.
                    </p>
                </div>

                <div className="flex justify-end pt-4">
                    <Button type="submit" isLoading={false}>
                        {category ? 'Update Changes' : 'Create Category'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default CategoryModal;
