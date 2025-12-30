import React, { useState } from 'react';
import type { ICategory } from '../../../../types';
import { ChevronRight, ChevronDown, Plus, Edit2, Trash } from 'lucide-react';

interface CategoryTreeItemProps {
    category: ICategory;
    onEdit: (cat: ICategory) => void;
    onDelete: (id: string) => void;
    onAddSub: (parent: ICategory) => void;
    depth?: number;
}

export const CategoryTreeItem: React.FC<CategoryTreeItemProps> = ({
    category,
    onEdit,
    onDelete,
    onAddSub,
    depth = 0
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasChildren = category.children && category.children.length > 0;

    return (
        <div className="select-none">
            <div
                className={`
            flex items-center justify-between p-3 rounded-lg hover:bg-surface-hover transition-colors group
            ${depth > 0 ? 'ml-6 border-l border-border' : ''}
        `}
            >
                <div className="flex items-center gap-2">
                    {hasChildren ? (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="p-1 hover:bg-surface-hover rounded text-text-secondary"
                        >
                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                    ) : (
                        <div className="w-6" />
                    )}

                    <div className="flex flex-col">
                        <span className="text-text-primary font-medium text-sm">{category.name}</span>
                        <span className="text-text-secondary text-[10px] font-mono">{category.slug}</span>
                    </div>

                    {!category.isActive && (
                        <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-red-500/10 text-red-500 rounded">Inactive</span>
                    )}
                </div>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onAddSub(category)}
                        className="p-1.5 text-green-500 hover:bg-green-500/10 rounded transition-colors"
                        title="Add Sub-category"
                    >
                        <Plus size={14} />
                    </button>
                    <button
                        onClick={() => onEdit(category)}
                        className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded transition-colors"
                        title="Edit"
                    >
                        <Edit2 size={14} />
                    </button>
                    <button
                        onClick={() => onDelete(category._id)}
                        className="p-1.5 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                        title="Delete"
                    >
                        <Trash size={14} />
                    </button>
                </div>
            </div>

            {isExpanded && hasChildren && (
                <div className="ml-2">
                    {category.children!.map(child => (
                        <CategoryTreeItem
                            key={child._id}
                            category={child}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onAddSub={onAddSub}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
