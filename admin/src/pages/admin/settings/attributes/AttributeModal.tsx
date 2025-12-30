import React, { useState, useEffect } from 'react';
import { Modal, Input, Button } from '../../../../components/common';
import { ATTRIBUTE_TYPE } from '../../../../types';
import type { IAttribute } from '../../../../types';
import { attributeService } from '../../../../api/services/attribute.service';
import { useDispatch } from 'react-redux';
import { addAttribute, updateAttribute, setLoading, setError } from '../../../../Redux/slices/attributeSlice';
import { Plus } from 'lucide-react';

interface AttributeModalProps {
    isOpen: boolean;
    onClose: () => void;
    attribute: IAttribute | null;
}

const AttributeModal: React.FC<AttributeModalProps> = ({ isOpen, onClose, attribute }) => {
    const dispatch = useDispatch();
    const [formData, setFormData] = useState<Partial<IAttribute>>({
        name: '',
        code: '',
        type: ATTRIBUTE_TYPE.TEXT,
        isRequired: false,
        options: [],
    });

    const [optionInput, setOptionInput] = useState('');

    useEffect(() => {
        if (attribute) {
            setFormData(attribute);
        } else {
            setFormData({
                name: '',
                code: '',
                type: ATTRIBUTE_TYPE.TEXT,
                isRequired: false,
                options: [],
            });
        }
    }, [attribute, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData((prev) => ({ ...prev, [name]: checked }));
    };

    const handleAddOption = () => {
        if (optionInput.trim()) {
            setFormData((prev) => ({
                ...prev,
                options: [...(prev.options || []), optionInput.trim()],
            }));
            setOptionInput('');
        }
    };

    const handleRemoveOption = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            options: (prev.options || []).filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(setLoading(true));

        try {
            if (attribute) {
                const res = await attributeService.update(attribute._id, formData);
                dispatch(updateAttribute(res.data));
            } else {
                const res = await attributeService.create(formData);
                dispatch(addAttribute(res.data));
            }
            onClose();
        } catch (error: any) {
            dispatch(setError(error.response?.data?.message || 'Something went wrong'));
        } finally {
            dispatch(setLoading(false));
        }
    };

    const isSelectionType =
        formData.type === ATTRIBUTE_TYPE.SELECT || formData.type === ATTRIBUTE_TYPE.MULTISELECT;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={attribute ? 'Edit Attribute' : 'Create Attribute'}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Attribute Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Color"
                />

                <Input
                    label="Attribute Code"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    required
                    placeholder="e.g. color"
                />

                <div className="space-y-1.5 w-full">
                    <label className="text-xs font-black uppercase tracking-widest text-text-secondary ml-1">
                        Data Type
                    </label>
                    <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="w-full bg-surface border border-border rounded-2xl text-sm text-text-primary px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/30 transition-all duration-200"
                    >
                        {Object.values(ATTRIBUTE_TYPE).map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                </div>

                {isSelectionType && (
                    <div className="space-y-2 p-4 bg-surface border border-border rounded-xl">
                        <label className="text-xs font-black uppercase tracking-widest text-text-secondary ml-1">
                            Options
                        </label>
                        <div className="flex gap-2">
                            <Input
                                value={optionInput}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOptionInput(e.target.value)}
                                placeholder="Enter option value"
                                className="flex-1"
                            />
                            <Button type="button" onClick={handleAddOption} variant="secondary">
                                <Plus size={18} />
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {formData.options?.map((opt, idx) => (
                                <div key={idx} className="flex items-center gap-1 bg-surface-hover text-xs px-2 py-1 rounded-full text-text-primary border border-border">
                                    <span>{opt}</span>
                                    <button type="button" onClick={() => handleRemoveOption(idx)} className="hover:text-red-500">
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex items-center space-x-2 pl-1">
                    <input
                        type="checkbox"
                        id="isRequired"
                        name="isRequired"
                        checked={formData.isRequired}
                        onChange={handleCheckboxChange}
                        className="w-4 h-4 rounded border-border text-brand-600 focus:ring-brand-500 bg-surface"
                    />
                    <label htmlFor="isRequired" className="text-sm text-text-secondary select-none cursor-pointer">
                        Required Attribute
                    </label>
                </div>

                <div className="flex justify-end pt-4">
                    <Button type="submit" isLoading={false}>
                        {attribute ? 'Update Changes' : 'Create Attribute'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

// Helper icon component for inline usage
const X = ({ size }: { size: number }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
);

export default AttributeModal;
