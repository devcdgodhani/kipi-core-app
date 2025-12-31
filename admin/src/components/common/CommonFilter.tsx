import React, { useState, useEffect } from 'react';
import { X, Check, Filter, RotateCcw } from 'lucide-react';
import CustomButton from './Button';

export interface FilterOption {
    label: string;
    value: any;
}

export interface FilterField {
    key: string;
    label: string;
    type: 'select' | 'text' | 'boolean';
    multiple?: boolean;
    options?: FilterOption[];
    placeholder?: string;
}

interface CommonFilterProps {
    isOpen: boolean;
    onClose: () => void;
    fields: FilterField[];
    onApply: (filters: Record<string, any>) => void;
    currentFilters: Record<string, any>;
}

export const CommonFilter: React.FC<CommonFilterProps> = ({
    isOpen,
    onClose,
    fields,
    onApply,
    currentFilters
}) => {
    const [selectedTab, setSelectedTab] = useState<string>(fields[0]?.key || '');
    const [tempFilters, setTempFilters] = useState<Record<string, any>>({});

    // Reset temp filters when modal opens with current active filters
    useEffect(() => {
        if (isOpen) {
            setTempFilters(currentFilters);
            if (!selectedTab && fields.length > 0) {
                setSelectedTab(fields[0].key);
            }
        }
    }, [isOpen, currentFilters, fields]);

    if (!isOpen) return null;

    const handleOptionClick = (key: string, value: any, isMultiple: boolean) => {
        setTempFilters(prev => {
            const currentVal = prev[key];

            if (isMultiple) {
                const arr = Array.isArray(currentVal) ? [...currentVal] : (currentVal !== undefined ? [currentVal] : []);
                const index = arr.indexOf(value);
                if (index > -1) {
                    arr.splice(index, 1);
                } else {
                    arr.push(value);
                }
                return { ...prev, [key]: arr.length > 0 ? arr : undefined };
            } else {
                // Toggle if same value, otherwise set new
                return { ...prev, [key]: currentVal === value ? undefined : value };
            }
        });
    };

    const handleClearAll = () => {
        const cleared: Record<string, any> = {};
        fields.forEach(f => {
            cleared[f.key] = undefined;
        });
        setTempFilters(cleared);
    };

    const handleApply = () => {
        onApply(tempFilters);
        onClose();
    };

    const activeField = fields.find(f => f.key === selectedTab);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col h-[600px] animate-in zoom-in-95 duration-200 border border-primary/10">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-primary text-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-xl">
                            <Filter size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tight font-mono">Advanced Filters</h2>
                            <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest leading-none">Refine your data view</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/80 hover:text-white"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body - Side Menu Layout */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Left Side Menu */}
                    <div className="w-1/3 border-r border-gray-100 bg-gray-50/50 overflow-y-auto p-4 space-y-2">
                        {fields.map((field) => {
                            const isActive = selectedTab === field.key;
                            const hasValue = tempFilters[field.key] !== undefined;

                            return (
                                <button
                                    key={field.key}
                                    onClick={() => setSelectedTab(field.key)}
                                    className={`w-full flex items-center justify-between px-4 py-4 rounded-2xl transition-all font-bold text-sm ${isActive
                                        ? 'bg-white shadow-md text-primary ring-1 ring-primary/5'
                                        : 'text-gray-500 hover:bg-white/50'
                                        }`}
                                >
                                    <span className="truncate pr-2">{field.label}</span>
                                    {hasValue && (
                                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Right Options Content */}
                    <div className="flex-1 overflow-y-auto p-8 relative">
                        {activeField && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">{activeField.label}</h3>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                                        Select {activeField.multiple ? 'one or more options' : 'an option'}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-2">
                                    {activeField.options?.map((option) => {
                                        const isSelected = Array.isArray(tempFilters[activeField.key])
                                            ? tempFilters[activeField.key].includes(option.value)
                                            : tempFilters[activeField.key] === option.value;

                                        return (
                                            <button
                                                key={String(option.value)}
                                                onClick={() => handleOptionClick(activeField.key, option.value, !!activeField.multiple)}
                                                className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${isSelected
                                                    ? 'border-primary bg-primary/5 text-primary'
                                                    : 'border-gray-100 hover:border-primary/20 bg-white text-gray-600'
                                                    }`}
                                            >
                                                <span className="font-bold">{option.label}</span>
                                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all ${isSelected
                                                    ? 'bg-primary border-primary text-white scale-110 shadow-lg shadow-primary/20'
                                                    : 'border-gray-200 bg-white'
                                                    }`}>
                                                    {isSelected && <Check size={14} strokeWidth={4} />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex items-center gap-4">
                    <button
                        onClick={handleClearAll}
                        className="px-6 py-4 flex items-center gap-2 text-gray-500 font-black uppercase text-[10px] tracking-[0.2em] hover:text-primary transition-colors"
                    >
                        <RotateCcw size={16} />
                        Clear Filter
                    </button>
                    <div className="flex-1" />
                    <button
                        onClick={onClose}
                        className="px-8 py-4 text-gray-500 font-black uppercase text-[10px] tracking-[0.2em] hover:bg-gray-100 rounded-2xl transition-all active:scale-95"
                    >
                        Cancel
                    </button>
                    <CustomButton
                        onClick={handleApply}
                        className="rounded-2xl px-12 h-14 shadow-xl shadow-primary/20"
                    >
                        Apply Filters
                    </CustomButton>
                </div>
            </div>
        </div>
    );
};
