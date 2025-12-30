import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { ICategory } from '../../../../types';
import { categoryService } from '../../../../api/services/category.service';
import { setCategoryTree, setLoading } from '../../../../Redux/slices/categorySlice';
import type { RootState } from '../../../../Redux/store';
import { Button } from '../../../../components/common';
import CategoryModal from './CategoryModal';
import { CategoryTreeItem } from './CategoryTreeItem';
import { Plus, RefreshCw, FolderTree } from 'lucide-react';

const CategoryList = () => {
    const dispatch = useDispatch();
    const { tree, loading } = useSelector((state: RootState) => state.category);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(null);
    const [parentCategory, setParentCategory] = useState<ICategory | null>(null);

    const fetchCategories = async () => {
        dispatch(setLoading(true));
        try {
            const res = await categoryService.getTree();
            dispatch(setCategoryTree(res.data));
        } catch (error) {
            console.error(error);
        } finally {
            dispatch(setLoading(false));
        }
    };

    useEffect(() => {
        fetchCategories();
    }, [dispatch]);

    const handleEdit = (cat: ICategory) => {
        setSelectedCategory(cat);
        setParentCategory(null);
        setIsModalOpen(true);
    };

    const handleAddSub = (parent: ICategory) => {
        setSelectedCategory(null);
        setParentCategory(parent);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this category? Sub-categories and Products might be affected.')) {
            try {
                await categoryService.delete(id);
                fetchCategories(); // Refresh tree
            } catch (error) {
                console.error(error);
            }
        }
    };

    const handleCreateTopLevel = () => {
        setSelectedCategory(null);
        setParentCategory(null);
        setIsModalOpen(true);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Categories</h1>
                    <p className="text-text-secondary text-sm">Manage category hierarchy and attribute associations.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => fetchCategories()} className="!p-2.5">
                        <RefreshCw size={18} />
                    </Button>
                    <Button onClick={handleCreateTopLevel} className="flex items-center gap-2">
                        <Plus size={18} /> Create Category
                    </Button>
                </div>
            </div>

            <div className="bg-surface border border-border rounded-lg p-6 min-h-[400px]">
                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                    </div>
                ) : tree.length > 0 ? (
                    <div className="space-y-1">
                        {tree.map(cat => (
                            <CategoryTreeItem
                                key={cat._id}
                                category={cat}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onAddSub={handleAddSub}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-text-secondary gap-4">
                        <FolderTree size={48} className="text-text-secondary/50" />
                        <p>No categories found.</p>
                        <Button onClick={handleCreateTopLevel} variant="outline" size="sm">Create First Category</Button>
                    </div>
                )}
            </div>

            <CategoryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                category={selectedCategory}
                parentCategory={parentCategory}
                categories={tree}
            />
        </div>
    );
};

export default CategoryList;
