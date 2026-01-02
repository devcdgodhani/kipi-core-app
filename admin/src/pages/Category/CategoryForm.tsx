import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Sliders } from 'lucide-react';
import { categoryService } from '../../services/category.service';
import { attributeService } from '../../services/attribute.service';
import { CATEGORY_STATUS, type ICategory } from '../../types/category';
import type { IAttribute } from '../../types/attribute';
import CustomInput from '../../components/common/Input';
import CustomButton from '../../components/common/Button';
import { ROUTES } from '../../routes/routeConfig';
import { fileStorageService } from '../../services/fileStorage.service';
import { FileManagerSelector } from '../../components/common/FileManagerSelector';
import { Image as ImageIcon, Upload, X } from 'lucide-react';
import { PopupModal } from '../../components/common/PopupModal';

const CategoryForm: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEdit = !!id;

    const [searchParams] = useSearchParams();
    const parentIdParam = searchParams.get('parentId');

    const [formData, setFormData] = useState<{
        name: string;
        parentId: string | null;
        description: string;
        image: string;
        status: CATEGORY_STATUS;
        order: number;
        attributeIds: string[];
    }>({
        name: '',
        parentId: parentIdParam || null,
        description: '',
        image: '',
        status: CATEGORY_STATUS.ACTIVE,
        order: 0,
        attributeIds: []
    });

    const [allCategories, setAllCategories] = useState<ICategory[]>([]);
    const [availableAttributes, setAvailableAttributes] = useState<IAttribute[]>([]);
    const [parentInheritedIds, setParentInheritedIds] = useState<string[]>([]);

    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isMainImageSelectorOpen, setIsMainImageSelectorOpen] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageUploading, setImageUploading] = useState(false);
    const [popup, setPopup] = useState({ isOpen: false, title: '', message: '', type: 'alert' as any, onConfirm: () => { } });
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            setPageLoading(true);
            try {
                // Fetch attributes
                const attrRes = await attributeService.getAll({ status: 'ACTIVE' }); // Assuming filtering by active
                if (attrRes?.data) {
                    setAvailableAttributes(attrRes.data);
                }

                // Fetch categories
                const catRes = await categoryService.getAll({ isTree: false });
                if (catRes?.data) {
                    setAllCategories(catRes.data);
                }

                // If Edit, populate form
                if (isEdit && catRes?.data) {
                    const match = catRes.data.find((c: any) => c._id === id);
                    if (match) {
                        setFormData({
                            name: match.name,
                            parentId: typeof match.parentId === 'object' ? match.parentId?._id : match.parentId || null,
                            description: match.description || '',
                            image: typeof match.image === 'object' ? match.image?._id : match.image || '',
                            status: match.status,
                            order: match.order || 0,
                            attributeIds: match.attributeIds || []
                        });
                        if (match.image && typeof match.image === 'object') {
                            setImagePreview(match.image.preSignedUrl);
                        }
                    }
                }
            } catch (err: any) {
                console.error(err);
                setError(err.response?.data?.message || 'Failed to load data');
            } finally {
                setPageLoading(false);
            }
        };
        fetchInitialData();
    }, [id, isEdit]);

    // Handle Parent ID changes to inheriting attributes
    useEffect(() => {
        const fetchParentAndInherit = async () => {
            // Capture currently inherited IDs (from previous parent) to remove them
            const oldInherited = parentInheritedIds;
            let newInherited: string[] = [];

            if (formData.parentId && formData.parentId !== 'null') {
                try {
                    // Fetch fresh parent data
                    const res = await categoryService.getOne(formData.parentId);
                    const parent = res.data;

                    if (parent && parent.attributeIds && parent.attributeIds.length > 0) {
                        newInherited = parent.attributeIds.map((id: any) =>
                            typeof id === 'object' ? id._id : id
                        );
                    }
                } catch (e) {
                    console.error("Failed to fetch parent attributes for inheritance", e);
                }
            }

            // Update inherited state
            setParentInheritedIds(newInherited);

            // Update Form Data: Remove old inherited, Add new inherited
            setFormData(prev => {
                const currentIds = prev.attributeIds || [];
                // Filter out IDs that were inherited from the OLD parent
                const cleanedIds = currentIds.filter(id => !oldInherited.includes(id));

                // Merge new inherited IDs
                const finalIds = Array.from(new Set([...cleanedIds, ...newInherited]));

                return {
                    ...prev,
                    attributeIds: finalIds
                };
            });
        };

        fetchParentAndInherit();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.parentId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'order' ? Number(value) : (value === 'null' ? null : value)
        }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        try {
            setImageUploading(true);
            const res = await fileStorageService.upload(
                Array.from(e.target.files),
                'category',
                'category'
            );
            if (res.data && res.data[0]) {
                const file = res.data[0];
                setFormData(prev => ({ ...prev, image: file._id }));
                setImagePreview(file.preSignedUrl || null);
            }
        } catch (err: any) {
            console.error('Upload failed', err);
            setError('Asset ingestion failed. Please try again.');
        } finally {
            setImageUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const removeImage = () => {
        setFormData(prev => ({ ...prev, image: '' }));
        setImagePreview(null);
    };

    const toggleAttribute = (attrId: string) => {
        if (parentInheritedIds.includes(attrId)) return; // Prevents removing inherited

        setFormData(prev => {
            const exists = prev.attributeIds.includes(attrId);
            let newIds;
            if (exists) {
                newIds = prev.attributeIds.filter(id => id !== attrId);
            } else {
                newIds = [...prev.attributeIds, attrId];
            }
            return { ...prev, attributeIds: newIds };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isEdit) {
                await categoryService.update(id!, formData as any);
            } else {
                await categoryService.create(formData as any);
            }
            navigate('/' + ROUTES.DASHBOARD.CATEGORIES);
        } catch (err: any) {
            setError(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} category`);
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) {
        return <div className="p-8 text-center text-gray-500 font-bold">Loading...</div>;
    }

    return (
        <>
            <div className="p-6 space-y-6">
                <div className="flex items-center gap-4 bg-white p-6 rounded-[2rem] border border-primary/5 shadow-sm">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
                    >
                        <ChevronLeft size={24} className="text-gray-700" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-primary tracking-tight uppercase font-mono">{isEdit ? 'Refine Category' : 'Architect New Category'}</h1>
                        <p className="text-sm text-gray-500 font-medium">{isEdit ? 'Update category structure and details' : 'Define a new product category'}</p>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-2xl text-center font-bold uppercase tracking-wider">
                                        {error}
                                    </div>
                                )}

                                <CustomInput label="Category Name" name="name" value={formData.name} onChange={handleChange} placeholder="Fashion, Electronics, etc." required />

                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Parent Hierarchy</label>
                                    <select
                                        name="parentId"
                                        value={formData.parentId || 'null'}
                                        onChange={handleChange}
                                        className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl py-4 px-4 focus:outline-none focus:border-primary/30 transition-all font-bold text-gray-700"
                                    >
                                        <option value="null">Root Category (No Parent)</option>
                                        {allCategories.filter(c => c._id !== id).map(c => (
                                            <option key={c._id} value={c._id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Category Asset</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {imagePreview ? (
                                            <div className="relative group rounded-3xl overflow-hidden aspect-video bg-gray-50 border-2 border-primary/10">
                                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsMainImageSelectorOpen(true)}
                                                        className="p-3 bg-white/20 backdrop-blur-md rounded-2xl hover:bg-white/30 transition-all text-white border border-white/30"
                                                        title="Change from Gallery"
                                                    >
                                                        <ImageIcon size={20} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={removeImage}
                                                        className="p-3 bg-red-500/80 backdrop-blur-md rounded-2xl hover:bg-red-600 transition-all text-white border border-red-400/30"
                                                        title="Remove Asset"
                                                    >
                                                        <X size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div
                                                onClick={() => !imageUploading && setIsMainImageSelectorOpen(true)}
                                                className="rounded-3xl border-2 border-dashed border-gray-200 aspect-video flex flex-col items-center justify-center gap-3 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer group"
                                            >
                                                <div className="p-4 rounded-2xl bg-gray-50 text-gray-400 group-hover:bg-white group-hover:text-primary transition-all shadow-sm">
                                                    <ImageIcon size={28} />
                                                </div>
                                                <span className="text-xs font-black text-gray-400 uppercase tracking-widest group-hover:text-primary transition-all">Select from Gallery</span>
                                            </div>
                                        )}

                                        <div className="flex flex-col gap-4">
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleImageUpload}
                                                className="hidden"
                                                accept="image/*"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={imageUploading}
                                                className="flex items-center justify-center gap-3 w-full py-4 px-6 rounded-2xl border-2 border-gray-100 bg-gray-50 hover:bg-white hover:border-primary/20 transition-all group disabled:opacity-50"
                                            >
                                                <Upload size={18} className="text-gray-400 group-hover:text-primary transition-all" />
                                                <span className="text-xs font-black text-gray-400 uppercase tracking-widest group-hover:text-primary transition-all">
                                                    {imageUploading ? 'Uploading...' : 'Direct Upload'}
                                                </span>
                                            </button>
                                            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100/50">
                                                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider leading-relaxed">
                                                    Direct upload will store this asset in the <span className="text-amber-700">/category</span> vault automatically.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Status</label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleChange}
                                            className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl py-4 px-4 focus:outline-none focus:border-primary/30 transition-all font-bold text-gray-700"
                                        >
                                            <option value={CATEGORY_STATUS.ACTIVE}>Visible / Active</option>
                                            <option value={CATEGORY_STATUS.INACTIVE}>Hidden / Inactive</option>
                                        </select>
                                    </div>
                                    <CustomInput label="Sort Order" name="order" type="number" value={formData.order} onChange={handleChange} />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl py-4 px-4 focus:outline-none focus:border-primary/30 transition-all font-bold text-gray-700 min-h-[100px]"
                                        placeholder="Brief overview of this category..."
                                    />
                                </div>

                                <div className="flex gap-4 pt-6 border-t border-gray-100">
                                    <button type="button" onClick={() => navigate(-1)} className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition-all">Cancel</button>
                                    <CustomButton type="submit" disabled={loading} className="flex-1 rounded-2xl h-14">{loading ? 'Processing...' : isEdit ? 'Update Hub' : 'Establish Category'}</CustomButton>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 h-full max-h-[800px] overflow-y-auto">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
                                <div className="p-2 rounded-xl bg-violet-50 text-violet-500">
                                    <Sliders size={20} />
                                </div>
                                <h3 className="font-bold text-gray-900">Attributes</h3>
                            </div>

                            <p className="text-xs text-gray-400 mb-4 font-medium leading-relaxed">
                                Associate attributes with this category. Inherited attributes from parent categories cannot be removed.
                            </p>

                            <div className="space-y-3">
                                {availableAttributes.length > 0 ? availableAttributes.map(attr => {
                                    const isInherited = parentInheritedIds.includes(attr._id);
                                    const isSelected = formData.attributeIds.includes(attr._id) || isInherited;

                                    return (
                                        <label
                                            key={attr._id}
                                            className={`flex items-start gap-3 p-3 rounded-2xl transition-all cursor-pointer border ${isSelected
                                                ? (isInherited ? 'bg-gray-50 border-gray-200 opacity-75' : 'bg-primary/5 border-primary/20')
                                                : 'hover:bg-gray-50 border-transparent hover:border-gray-100'
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                disabled={isInherited}
                                                onChange={() => toggleAttribute(attr._id)}
                                                className="mt-1 w-4 h-4 rounded text-primary focus:ring-primary border-gray-300"
                                            />
                                            <div>
                                                <span className={`block text-sm font-bold ${isSelected ? 'text-gray-900' : 'text-gray-600'
                                                    }`}>
                                                    {attr.name}
                                                    {isInherited && <span className="ml-2 text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-md uppercase tracking-wider">Inherited</span>}
                                                </span>
                                                <span className="text-[10px] text-gray-400 uppercase tracking-wider">{attr.valueType}</span>
                                            </div>
                                        </label>
                                    );
                                }) : (
                                    <div className="text-center py-8 text-gray-400 text-xs">
                                        No attributes available
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <FileManagerSelector
                isOpen={isMainImageSelectorOpen}
                onClose={() => setIsMainImageSelectorOpen(false)}
                onSelect={(file) => {
                    setFormData(prev => ({ ...prev, image: file._id }));
                    setImagePreview(file.preSignedUrl || null);
                    setIsMainImageSelectorOpen(false);
                }}
            />
            <PopupModal
                isOpen={popup.isOpen}
                onClose={() => setPopup(prev => ({ ...prev, isOpen: false }))}
                title={popup.title}
                message={popup.message}
                type={popup.type}
                onConfirm={popup.onConfirm}
            />
        </>
    );
};

export default CategoryForm;
