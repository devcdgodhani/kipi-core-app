
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    Zap,
    Tag,
    Clock,
    ShoppingCart,
    Search,
    X,
    CheckCircle2,
    Calendar,
    ArrowUpDown,
    Info,
    Plus
} from 'lucide-react';
import { flashDealService } from '../../services/flashDeal.service';
import { productService } from '../../services/product.service';
import { FLASH_DEAL_STATUS, FLASH_DEAL_DISCOUNT_TYPE } from '../../types/flashDeal.types';
import type { FlashDeal } from '../../types/flashDeal.types';
import type { IProduct } from '../../types/product';
import axios from 'axios';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';

const FlashDealForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEdit);
    const [formData, setFormData] = useState<Partial<FlashDeal>>({
        name: '',
        description: '',
        productIds: [],
        discountType: FLASH_DEAL_DISCOUNT_TYPE.PERCENTAGE,
        discountValue: 0,
        startTime: new Date().toISOString().slice(0, 16),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        maxQuantityPerUser: 1,
        totalQuantityLimit: 100,
        status: FLASH_DEAL_STATUS.DRAFT,
    });

    const [isProductSelectorOpen, setIsProductSelectorOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState<IProduct[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<IProduct[]>([]);
    const [searchingProducts, setSearchingProducts] = useState(false);

    useEffect(() => {
        if (isEdit) {
            const fetchFlashDeal = async () => {
                try {
                    const response = await flashDealService.getOne(id);
                    if (response && response.data) {
                        const data = response.data;
                        setFormData({
                            ...data,
                            startTime: data.startTime ? new Date(data.startTime).toISOString().slice(0, 16) : '',
                            endTime: data.endTime ? new Date(data.endTime).toISOString().slice(0, 16) : '',
                        });

                        // Fetch selected products details
                        if (data.productIds && data.productIds.length > 0) {
                            const prodRes = await productService.getAll({ _id: data.productIds });
                            if (prodRes && prodRes.data) {
                                setSelectedProducts(prodRes.data);
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error fetching flash deal:', error);
                    toast.error('Failed to fetch flash deal details');
                    navigate('/flash-deals');
                } finally {
                    setFetching(false);
                }
            };
            fetchFlashDeal();
        }
    }, [id, isEdit, navigate]);

    const fetchProducts = useCallback(async (query: string) => {
        try {
            setSearchingProducts(true);
            const response = await productService.getWithPagination({ search: query, limit: 20 });
            if (response && response.data) {
                setProducts(response.data.recordList || []);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setSearchingProducts(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm) fetchProducts(searchTerm);
            else setProducts([]);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, fetchProducts]);

    const handleProductSelect = (product: IProduct) => {
        if (!formData.productIds?.includes(product._id)) {
            setFormData(prev => ({
                ...prev,
                productIds: [...(prev.productIds || []), product._id]
            }));
            setSelectedProducts(prev => [...prev, product]);
        }
        setIsProductSelectorOpen(false);
        setSearchTerm('');
    };

    const removeProduct = (productId: string) => {
        setFormData(prev => ({
            ...prev,
            productIds: prev.productIds?.filter(id => id !== productId)
        }));
        setSelectedProducts(prev => prev.filter(p => p._id !== productId));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.productIds || formData.productIds.length === 0) {
            toast.error('At least one product must be associated with the deal');
            return;
        }

        try {
            setLoading(true);
            const submissionData = { ...formData };

            if (isEdit && id) {
                await flashDealService.updateById(id, submissionData);
                toast.success('Campaign synchronized successfully');
            } else {
                await flashDealService.create(submissionData);
                toast.success('Flash deal initiated successfully');
            }
            navigate('/flash-deals');
        } catch (error: unknown) {
            console.error('Error saving flash deal:', error);
            const message = axios.isAxiosError(error) ? error.response?.data?.message : 'Transaction failed';
            toast.error(message || 'Transaction failed');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) : value
        }));
    };

    if (fetching) {
        return (
            <div className="p-6 flex flex-col items-center justify-center min-h-[400px] text-gray-500 italic">
                <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4" />
                Aggregating campaign analytics...
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-8">
            {/* Header with Back Button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-primary/5 shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/flash-deals')}
                        className="p-3 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-2xl transition-all border border-transparent hover:border-amber-100"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-primary tracking-tight uppercase font-mono">{isEdit ? 'Refine Campaign' : 'Initiate Flash'}</h1>
                        <p className="text-sm text-gray-500 font-medium">Configure high-velocity promotional architecture</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/flash-deals')}
                        className="rounded-2xl h-14 px-6 font-black uppercase text-[10px] tracking-widest"
                    >
                        Abort
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="rounded-2xl shadow-xl shadow-amber-500/20 h-14 px-8 bg-amber-500 hover:bg-amber-600 border-none"
                    >
                        <Save size={20} className="mr-2" />
                        <span>{loading ? 'Processing...' : (isEdit ? 'Update Protocol' : 'Push to Live')}</span>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Side: Campaign Logistics */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                <Zap size={20} />
                            </div>
                            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Campaign Core</h2>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Campaign Identity *</label>
                            <Input
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Midnight Madness Sale"
                                required
                                className="font-bold text-lg h-14 bg-gray-50/50 border-2 focus:border-amber-500/20"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Strategy Brief</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={3}
                                placeholder="Objective of this price drop..."
                                className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-[2rem] p-5 text-sm font-medium focus:outline-none focus:border-amber-500/20 transition-all resize-none"
                            />
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                    <ShoppingCart size={20} />
                                </div>
                                <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Product Selection</h2>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsProductSelectorOpen(true)}
                                className="px-5 py-2 rounded-xl bg-amber-500 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-amber-500/20 hover:scale-105 transition-all"
                            >
                                <Plus size={14} className="inline mr-1" /> Add Items
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full min-h-[100px]">
                            {selectedProducts.length > 0 ? (
                                selectedProducts.map(product => (
                                    <div key={product._id} className="group relative flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 hover:border-amber-500/20 transition-all">
                                        <div className="w-12 h-12 rounded-lg bg-white overflow-hidden border border-gray-100 shrink-0">
                                            {product.mainImage ? (
                                                <img src={product.mainImage} alt={product.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <Tag size={18} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-black text-gray-900 truncate uppercase tracking-tight">{product.name}</p>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Base: ₹{product.basePrice}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeProduct(product._id)}
                                            className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-2 flex flex-col items-center justify-center py-8 text-gray-400 opacity-50 border-2 border-dashed border-gray-100 rounded-[2rem]">
                                    <ShoppingCart size={32} className="mb-2" />
                                    <p className="text-[10px] font-black uppercase tracking-widest italic">No products enlisted</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                <Clock size={20} />
                            </div>
                            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Throttling & Velocity</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Max Units Per Consumer</label>
                                <Input
                                    type="number"
                                    name="maxQuantityPerUser"
                                    value={formData.maxQuantityPerUser}
                                    onChange={handleInputChange}
                                    min={1}
                                    className="h-14 bg-gray-50/50 border-2 font-black text-lg focus:border-amber-500/20"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Total Inventory Cap</label>
                                <Input
                                    type="number"
                                    name="totalQuantityLimit"
                                    value={formData.totalQuantityLimit}
                                    onChange={handleInputChange}
                                    min={1}
                                    className="h-14 bg-gray-50/50 border-2 font-black text-lg focus:border-amber-500/20"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Financial Dynamics */}
                <div className="space-y-8">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                <ArrowUpDown size={20} />
                            </div>
                            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Economics</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Reduction Strategy</label>
                                <select
                                    name="discountType"
                                    value={formData.discountType}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl h-14 px-4 text-sm font-black uppercase tracking-widest focus:outline-none focus:border-amber-500/20 transition-all cursor-pointer"
                                >
                                    {Object.values(FLASH_DEAL_DISCOUNT_TYPE).map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Price Drop Value</label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        name="discountValue"
                                        value={formData.discountValue}
                                        onChange={handleInputChange}
                                        min={0}
                                        className="h-14 bg-gray-50/50 border-2 font-black text-lg focus:border-amber-500/20 px-4"
                                    />
                                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-primary font-black text-sm uppercase tracking-widest">
                                        {formData.discountType === FLASH_DEAL_DISCOUNT_TYPE.PERCENTAGE ? '%' : 'INR'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                <Calendar size={20} />
                            </div>
                            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Timeline</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Engagement Start</label>
                                <Input
                                    type="datetime-local"
                                    name="startTime"
                                    value={formData.startTime}
                                    onChange={handleInputChange}
                                    className="h-14 bg-gray-50/50 border-2 focus:border-amber-500/20"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Automatic Cut-off</label>
                                <Input
                                    type="datetime-local"
                                    name="endTime"
                                    value={formData.endTime}
                                    onChange={handleInputChange}
                                    className="h-14 bg-gray-50/50 border-2 focus:border-amber-500/20"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                <Info size={20} />
                            </div>
                            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Campaign State</h2>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Current Lifecycle</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl h-14 px-4 text-sm font-black uppercase tracking-widest focus:outline-none focus:border-amber-500/20 transition-all cursor-pointer"
                            >
                                {Object.values(FLASH_DEAL_STATUS).map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Selector Modal */}
            <Modal
                isOpen={isProductSelectorOpen}
                onClose={() => setIsProductSelectorOpen(false)}
                title="Integrate Products into Deal"
                maxWidth="max-w-2xl"
            >
                <div className="p-6 space-y-6">
                    <div className="relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-amber-500/40 group-focus-within:text-amber-500 transition-colors duration-300" size={18} />
                        <input
                            type="text"
                            placeholder="Query by name, SKU or reference..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:bg-white focus:border-amber-500/20 transition-all font-bold text-gray-700 h-14"
                            autoFocus
                        />
                    </div>

                    <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                        {searchingProducts ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Scanning Catalog...</span>
                            </div>
                        ) : products.length > 0 ? (
                            products.map(product => (
                                <div
                                    key={product._id}
                                    onClick={() => handleProductSelect(product)}
                                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer group ${formData.productIds?.includes(product._id) ? 'bg-amber-50 border-amber-200' : 'hover:bg-gray-50 border-transparent hover:border-gray-100'}`}
                                >
                                    <div className="w-12 h-12 rounded-xl bg-white overflow-hidden border border-gray-100 shrink-0">
                                        {product.mainImage ? (
                                            <img src={product.mainImage} alt={product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <Tag size={18} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black text-gray-900 truncate uppercase tracking-tight">{product.name}</p>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">₹{product.basePrice}</span>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">{product.slug}</span>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-gray-100 group-hover:border-amber-500/20 group-hover:bg-amber-500 transition-all text-transparent group-hover:text-white">
                                        {formData.productIds?.includes(product._id) ? <CheckCircle2 size={16} className="text-amber-500" /> : <Plus size={16} />}
                                    </div>
                                </div>
                            ))
                        ) : searchTerm.length > 2 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                <Search size={32} className="mb-2 opacity-20" />
                                <span className="text-[10px] font-black uppercase tracking-widest">No matching assets found</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                <Info size={32} className="mb-2 opacity-20" />
                                <span className="text-[10px] font-black uppercase tracking-widest italic leading-relaxed text-center px-8">
                                    Initiate search to identify products for the flash deal campaign
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default FlashDealForm;
