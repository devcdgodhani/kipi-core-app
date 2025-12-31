import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Save,
    X,
    Plus,
    Loader2,
    AlertCircle,
    ArrowLeft,
    Type,
    List,
    Settings
} from 'lucide-react';
import { attributeService } from '../../services/attribute.service';
import type { IAttribute, IAttributeOption } from '../../types/attribute';
import { ATTRIBUTE_VALUE_TYPE, ATTRIBUTE_INPUT_TYPE, ATTRIBUTE_STATUS } from '../../types/attribute';
import { ROUTES } from '../../routes/routeConfig';

const AttributeForm: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEditMode);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<Partial<IAttribute>>({
        name: '',
        slug: '',
        description: '',
        valueType: ATTRIBUTE_VALUE_TYPE.TEXT,
        inputType: ATTRIBUTE_INPUT_TYPE.TEXT_INPUT,
        status: ATTRIBUTE_STATUS.ACTIVE,
        isFilterable: false,
        isVariant: false,
        isRequired: false,
        options: [],
        unit: ''
    });

    useEffect(() => {
        if (id) {
            fetchAttribute(id);
        }
    }, [id]);

    const fetchAttribute = async (attributeId: string) => {
        try {
            setFetching(true);
            const response = await attributeService.getOne(attributeId);
            if (response && response.data) {
                setFormData(response.data);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch attribute details');
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (field: keyof IAttribute, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleOptionChange = (index: number, field: keyof IAttributeOption, value: string) => {
        const newOptions = [...(formData.options || [])];
        if (!newOptions[index]) {
            newOptions[index] = { label: '', value: '' };
        }
        newOptions[index] = { ...newOptions[index], [field]: value };
        setFormData(prev => ({ ...prev, options: newOptions }));
    };

    const addOption = () => {
        setFormData(prev => ({
            ...prev,
            options: [...(prev.options || []), { label: '', value: '' }]
        }));
    };

    const removeOption = (index: number) => {
        const newOptions = [...(formData.options || [])];
        newOptions.splice(index, 1);
        setFormData(prev => ({ ...prev, options: newOptions }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isEditMode && id) {
                await attributeService.update(id, formData);
            } else {
                await attributeService.create(formData);
            }
            navigate('/' + ROUTES.DASHBOARD.ATTRIBUTES);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save attribute');
            setLoading(false);
        }
    };

    const needsOptions = [
        ATTRIBUTE_VALUE_TYPE.SELECT,
        ATTRIBUTE_VALUE_TYPE.MULTI_SELECT
    ].includes(formData.valueType as any);

    const isColorType = formData.valueType === ATTRIBUTE_VALUE_TYPE.COLOR;

    if (fetching) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 size={40} className="text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <button
                onClick={() => navigate('/' + ROUTES.DASHBOARD.ATTRIBUTES)}
                className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-bold uppercase text-xs tracking-widest"
            >
                <ArrowLeft size={16} />
                Back to Attributes
            </button>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase font-mono">
                            {isEditMode ? 'Edit Attribute' : 'New Attribute'}
                        </h1>
                        <p className="text-sm text-gray-500 font-medium">Define attribute properties and values</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => navigate('/' + ROUTES.DASHBOARD.ATTRIBUTES)}
                            className="px-6 py-3 rounded-2xl border-2 border-transparent hover:bg-gray-100 text-gray-500 font-bold uppercase text-xs tracking-widest transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 rounded-2xl bg-primary text-white font-bold uppercase text-xs tracking-widest hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-primary/20"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            Save Attribute
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                        <AlertCircle size={18} />
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Main Info */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 space-y-6">
                            <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
                                <div className="p-2 rounded-xl bg-blue-50 text-blue-500">
                                    <Type size={20} />
                                </div>
                                <h3 className="font-bold text-gray-900">Basic Information</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Attribute Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-primary/20 rounded-2xl px-4 py-3 outline-none transition-all font-bold text-gray-700"
                                        placeholder="e.g. Size, Color"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Slug (Optional)</label>
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={(e) => handleChange('slug', e.target.value)}
                                        className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-primary/20 rounded-2xl px-4 py-3 outline-none transition-all font-medium text-gray-600"
                                        placeholder="e.g. size, color"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => handleChange('description', e.target.value)}
                                        className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-primary/20 rounded-2xl px-4 py-3 outline-none transition-all font-medium text-gray-600 min-h-[100px] resize-none"
                                        placeholder="Internal description of the attribute..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Options Config */}
                        {(needsOptions || isColorType) && (
                            <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 space-y-6">
                                <div className="flex items-center justify-between pb-4 border-b border-gray-50">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-violet-50 text-violet-500">
                                            <List size={20} />
                                        </div>
                                        <h3 className="font-bold text-gray-900">Attribute Options</h3>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addOption}
                                        className="px-4 py-2 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                                    >
                                        <Plus size={14} />
                                        Add Option
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {formData.options?.map((option, index) => (
                                        <div key={index} className="flex gap-3 items-center group">
                                            <div className="flex-1 grid grid-cols-2 gap-3">
                                                <input
                                                    required
                                                    type="text"
                                                    value={option.label}
                                                    onChange={(e) => handleOptionChange(index, 'label', e.target.value)}
                                                    placeholder="Label (e.g. Red, XL)"
                                                    className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-primary/20 rounded-xl px-4 py-2 outline-none text-sm font-medium"
                                                />
                                                <div className="flex gap-2">
                                                    <input
                                                        required
                                                        type="text"
                                                        value={option.value}
                                                        onChange={(e) => handleOptionChange(index, 'value', e.target.value)}
                                                        placeholder="Value (e.g. red, xl)"
                                                        className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-primary/20 rounded-xl px-4 py-2 outline-none text-sm font-medium"
                                                    />
                                                    {isColorType && (
                                                        <div className="relative w-10 h-10 flex-shrink-0">
                                                            <input
                                                                type="color"
                                                                value={option.color || '#000000'}
                                                                onChange={(e) => handleOptionChange(index, 'color', e.target.value)}
                                                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                                            />
                                                            <div
                                                                className="w-full h-full rounded-xl border border-gray-200 shadow-sm"
                                                                style={{ backgroundColor: option.color || '#000000' }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeOption(index)}
                                                className="p-2 text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    ))}
                                    {(!formData.options || formData.options.length === 0) && (
                                        <div className="py-8 text-center text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                                            <p className="text-sm">No options added yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Config */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 space-y-6">
                            <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
                                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-500">
                                    <Settings size={20} />
                                </div>
                                <h3 className="font-bold text-gray-900">Configuration</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Data Type</label>
                                    <select
                                        value={formData.valueType}
                                        onChange={(e) => handleChange('valueType', e.target.value)}
                                        className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-primary/20 rounded-2xl px-4 py-3 outline-none transition-all font-bold text-gray-700 appearance-none"
                                    >
                                        {Object.values(ATTRIBUTE_VALUE_TYPE).map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Input Widget</label>
                                    <select
                                        value={formData.inputType}
                                        onChange={(e) => handleChange('inputType', e.target.value)}
                                        className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-primary/20 rounded-2xl px-4 py-3 outline-none transition-all font-bold text-gray-700 appearance-none"
                                    >
                                        {Object.values(ATTRIBUTE_INPUT_TYPE).map(t => (
                                            <option key={t} value={t}>{t.replace('_', ' ')}</option>
                                        ))}
                                    </select>
                                </div>

                                {formData.valueType === ATTRIBUTE_VALUE_TYPE.NUMBER && (
                                    <div className="space-y-2 animate-in slide-in-from-top-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Unit</label>
                                        <input
                                            type="text"
                                            value={formData.unit}
                                            onChange={(e) => handleChange('unit', e.target.value)}
                                            className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-primary/20 rounded-2xl px-4 py-3 outline-none transition-all font-medium text-gray-600"
                                            placeholder="e.g. cm, kg, m"
                                        />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => handleChange('status', e.target.value)}
                                        className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-primary/20 rounded-2xl px-4 py-3 outline-none transition-all font-bold text-gray-700 appearance-none"
                                    >
                                        {Object.values(ATTRIBUTE_STATUS).map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 space-y-4">
                            <label className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 cursor-pointer transition-colors">
                                <input
                                    type="checkbox"
                                    checked={formData.isFilterable}
                                    onChange={(e) => handleChange('isFilterable', e.target.checked)}
                                    className="w-5 h-5 rounded-md text-primary focus:ring-primary border-gray-300"
                                />
                                <div>
                                    <span className="block font-bold text-gray-900 text-sm">Filterable</span>
                                    <span className="block text-xs text-gray-400">Use in product filters</span>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 cursor-pointer transition-colors">
                                <input
                                    type="checkbox"
                                    checked={formData.isVariant}
                                    onChange={(e) => handleChange('isVariant', e.target.checked)}
                                    className="w-5 h-5 rounded-md text-primary focus:ring-primary border-gray-300"
                                />
                                <div>
                                    <span className="block font-bold text-gray-900 text-sm">Is Variant</span>
                                    <span className="block text-xs text-gray-400">Used for SKU variations</span>
                                </div>
                            </label>

                            <label className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 cursor-pointer transition-colors">
                                <input
                                    type="checkbox"
                                    checked={formData.isRequired}
                                    onChange={(e) => handleChange('isRequired', e.target.checked)}
                                    className="w-5 h-5 rounded-md text-primary focus:ring-primary border-gray-300"
                                />
                                <div>
                                    <span className="block font-bold text-gray-900 text-sm">Required</span>
                                    <span className="block text-xs text-gray-400">Mandatory for products</span>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AttributeForm;
