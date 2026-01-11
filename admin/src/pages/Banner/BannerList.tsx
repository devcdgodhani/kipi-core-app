
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Image as ImageIcon,
    RotateCcw,
    Eye,
    EyeOff,
    Link as LinkIcon,
    ArrowUpDown
} from 'lucide-react';
import { bannerService } from '../../services/banner.service';
import { BANNER_STATUS } from '../../types/banner.types';
import type { Banner } from '../../types/banner.types';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import { Table, type Column } from '../../components/common/Table';
import { PopupModal } from '../../components/common/PopupModal';

const BannerList: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [bannerToDelete, setBannerToDelete] = useState<string | null>(null);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const fetchBanners = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                page,
                limit,
                search: search || undefined,
                status: status || undefined,
            };
            const response = await bannerService.getWithPagination(params);
            if (response && response.data) {
                setBanners(response.data.recordList || []);
                setTotalRecords(response.data.totalRecords || 0);
                setTotalPages(response.data.totalPages || 0);
            }
        } catch (error) {
            console.error('Error fetching banners:', error);
            toast.error('Failed to fetch banners');
        } finally {
            setLoading(false);
        }
    }, [page, limit, search, status]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchBanners();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchBanners]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchParams(prev => {
            prev.set('search', e.target.value);
            prev.set('page', '1');
            return prev;
        });
    };

    const handleFilterChange = (key: string, value: string) => {
        setSearchParams(prev => {
            if (value) {
                prev.set(key, value);
            } else {
                prev.delete(key);
            }
            prev.set('page', '1');
            return prev;
        });
    };

    const handleDelete = (id: string) => {
        setBannerToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!bannerToDelete) return;
        try {
            await bannerService.deleteByFilter(bannerToDelete);
            toast.success('Banner deleted successfully');
            fetchBanners();
        } catch (error) {
            console.error('Error deleting banner:', error);
            toast.error('Failed to delete banner');
        } finally {
            setIsDeleteModalOpen(false);
            setBannerToDelete(null);
        }
    };

    const getStatusColor = (status: BANNER_STATUS) => {
        switch (status) {
            case BANNER_STATUS.ACTIVE: return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case BANNER_STATUS.INACTIVE: return 'bg-gray-50 text-gray-500 border-gray-100';
            case BANNER_STATUS.DELETED: return 'bg-rose-50 text-rose-500 border-rose-100';
            default: return 'bg-gray-50 text-gray-500 border-gray-100';
        }
    };

    const columns: Column<Banner>[] = [
        {
            header: 'Visual Content',
            key: 'imageId',
            render: (banner) => (
                <div className="flex items-center gap-4 py-1">
                    <div className="w-20 h-10 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 shadow-inner group relative">
                        {banner.imageId ? (
                            <img
                                src={`${(import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1/admin').replace('/admin', '')}/public/uploads/${banner.imageId}`}
                                alt={banner.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=No+Image';
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <ImageIcon size={16} />
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <p className="font-bold text-gray-900 leading-tight tracking-wide">{banner.title}</p>
                        <p className="text-[10px] font-semibold text-gray-400 mt-1 uppercase tracking-tighter truncate max-w-[200px]">
                            {banner.subtitle || 'Promotional banner'}
                        </p>
                    </div>
                </div>
            )
        },
        {
            header: 'Interaction',
            key: 'linkType',
            render: (banner) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-50 rounded-lg border border-gray-100 w-fit">
                        <LinkIcon size={10} className="text-primary/40" />
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-tight">{banner.linkType}</span>
                    </div>
                    {banner.linkValue && (
                        <span className="text-[9px] font-medium text-gray-400 truncate max-w-[150px]">{banner.linkValue}</span>
                    )}
                </div>
            )
        },
        {
            header: 'Display Order',
            key: 'displayOrder',
            render: (banner) => (
                <div className="flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-full border border-primary/10 w-fit">
                    <ArrowUpDown size={12} className="text-primary" />
                    <span className="text-[11px] font-black text-primary">{banner.displayOrder}</span>
                </div>
            )
        },
        {
            header: 'Visibility',
            key: 'isActive',
            render: (banner) => (
                <div className="flex items-center gap-2">
                    {banner.isActive ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                            <Eye size={14} />
                            <span>Visible</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 text-rose-500 font-black text-[10px] uppercase tracking-widest">
                            <EyeOff size={14} />
                            <span>Hidden</span>
                        </div>
                    )}
                </div>
            )
        },
        {
            header: 'Status',
            key: 'status',
            render: (banner) => (
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border ${getStatusColor(banner.status)}`}>
                    {banner.status}
                </span>
            )
        },
        {
            header: 'Action',
            key: 'actions',
            align: 'right',
            render: (banner) => (
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => navigate(`/banners/edit/${banner._id}`)}
                        className="p-3 text-primary hover:bg-primary/5 rounded-2xl transition-all border border-transparent hover:border-primary/10 group"
                        title="Edit"
                    >
                        <Edit size={18} className="group-hover:scale-110 transition-transform" />
                    </button>
                    <button
                        onClick={() => handleDelete(banner._id)}
                        className="p-3 text-rose-500 hover:bg-rose-50 rounded-2xl transition-all border border-transparent hover:border-rose-100 group"
                        title="Delete"
                    >
                        <Trash2 size={18} className="group-hover:scale-110 transition-transform" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Premium Hero Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/10 transition-colors duration-1000" />
                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                        <ImageIcon size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-primary tracking-tight uppercase font-mono">Banner Hub</h1>
                        <p className="text-sm text-gray-500 font-medium">Manage home screen hero sliders and promotional graphics</p>
                    </div>
                </div>
                <Button
                    onClick={() => navigate('/banners/create')}
                    className="rounded-2xl shadow-xl shadow-primary/20 h-14 px-8 relative z-10"
                >
                    <Plus size={20} className="mr-2" />
                    <span>Create New Banner</span>
                </Button>
            </div>

            {/* Top Bar with Search and Filters */}
            <div className="flex flex-col xl:flex-row gap-4 items-center">
                <div className="flex-1 relative group w-full xl:w-auto">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors duration-300" size={22} />
                    <input
                        type="text"
                        placeholder="Search banners by title..."
                        value={search}
                        onChange={handleSearch}
                        className="w-full bg-white border-2 border-primary/5 rounded-[2rem] py-5 pl-16 pr-6 focus:outline-none focus:border-primary/20 transition-all font-bold text-gray-700 shadow-xl shadow-gray-100/50 h-16"
                    />
                </div>

                <div className="flex flex-wrap gap-3 w-full xl:w-auto h-full items-center">
                    <div className="flex items-center gap-3 bg-white border-2 border-primary/5 rounded-[2rem] px-6 h-16 shadow-xl shadow-gray-100/50">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Status</span>
                        <select
                            className="bg-transparent focus:outline-none font-black text-primary uppercase text-[10px] tracking-widest cursor-pointer"
                            value={status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            {Object.values(BANNER_STATUS).map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    {(search || status) && (
                        <button
                            onClick={() => setSearchParams({ page: '1', limit: '10' })}
                            className="px-8 h-16 rounded-[2rem] bg-rose-50 border-2 border-rose-100 text-rose-500 hover:bg-rose-100 transition-all font-black uppercase text-[10px] tracking-widest flex items-center gap-2 shadow-xl shadow-rose-100/50"
                        >
                            <RotateCcw size={18} />
                            Reset Hub
                        </button>
                    )}
                </div>
            </div>

            <Table
                data={banners}
                columns={columns}
                isLoading={loading}
                keyExtractor={(banner) => banner._id}
                emptyMessage="No banners found"
                pagination={totalRecords > 0 ? {
                    currentPage: page,
                    totalPages: totalPages,
                    totalRecords: totalRecords,
                    pageSize: limit,
                    onPageChange: (p) => setSearchParams(prev => { prev.set('page', p.toString()); return prev; }),
                    hasPreviousPage: page > 1,
                    hasNextPage: page < totalPages
                } : undefined}
            />

            {isDeleteModalOpen && (
                <PopupModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => {
                        setIsDeleteModalOpen(false);
                        setBannerToDelete(null);
                    }}
                    title="Confirm Deletion"
                    message="Are you sure you want to delete this banner? This action cannot be undone."
                    type="confirm"
                    onConfirm={confirmDelete}
                    confirmLabel="Delete"
                    cancelLabel="Cancel"
                />
            )}
        </div>
    );
};

export default BannerList;
