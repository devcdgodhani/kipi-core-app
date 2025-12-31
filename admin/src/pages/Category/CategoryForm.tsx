import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { categoryService } from '../../services/category.service';
import { CATEGORY_STATUS, type ICategory } from '../../types/category';
import CustomInput from '../../components/common/Input';
import CustomButton from '../../components/common/Button';
import { ROUTES } from '../../routes/routeConfig';

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
    }>({
        name: '',
        parentId: parentIdParam || null,
        description: '',
        image: '',
        status: CATEGORY_STATUS.ACTIVE,
        order: 0,
    });
    const [allCategories, setAllCategories] = useState<ICategory[]>([]);
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            setPageLoading(true);
            try {
                // Fetch all categories for parent selection
                const res = await categoryService.getAll({ isTree: false });
                if (res?.data) {
                    setAllCategories(res.data);
                }

                // Fetch category details if edit
                if (isEdit) {
                    // Assuming getAll returns everything, we might find it in the list or fetch individually.
                    // Ideally fetch one. Category service usually has getOne or we filter.
                    // categoryService.getAll returns array.
                    // Let's try to find in the already fetched list if we can, or just re-fetch properly.
                    // Given the previous pattern, let's assume we can finding it or fetching it.
                    // If no getOne, we filter local allCategories if available?
                    // But wait, allCategories might not have everything if paginated? 
                    // But here getAll implies all for categories typically.
                    // Let's rely on finding it in the response of getAll for now as per CategoryList logic (which used getAll).
                    // Or ideally implement getOne.
                    // Let's try to find it in the fetched `res.data`.
                    if (res?.data) {
                        const match = res.data.find((c: any) => c._id === id);
                        if (match) {
                            setFormData({
                                name: match.name,
                                parentId: typeof match.parentId === 'object' ? match.parentId?._id : match.parentId || null,
                                description: match.description || '',
                                image: match.image || '',
                                status: match.status,
                                order: match.order || 0,
                            });
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'order' ? Number(value) : (value === 'null' ? null : value)
        }));
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

            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 max-w-4xl mx-auto">
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

                    <CustomInput label="Display Image URL" name="image" value={formData.image} onChange={handleChange} placeholder="https://..." />

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
    );
};

export default CategoryForm;
