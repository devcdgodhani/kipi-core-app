import React, { useEffect, useState, useRef } from 'react';
import {
    Folder, File, Image as ImageIcon, Film, Music, FileText,
    Search, Filter, Grid, List as ListIcon,
    Trash2, Download, ArrowLeft, FolderPlus, Upload, RefreshCw, Move,
    ChevronRight, Home
} from 'lucide-react';
import { fileStorageService } from '../../services/fileStorage.service';
import type { IFileStorage, IFileStorageFilters } from '../../types/fileStorage';
import { CommonFilter, type FilterField } from '../../components/common/CommonFilter';
import { useSearchParams } from 'react-router-dom';
import CustomButton from '../../components/common/Button';
import { PopupModal } from '../../components/common/PopupModal';

const filterFields: FilterField[] = [
    {
        key: 'cloudType',
        label: 'Storage Type',
        type: 'select',
        options: [
            { label: 'AWS S3', value: 'AWS_S3' },
            { label: 'Cloudinary', value: 'CLOUDINARY' },
        ]
    },
    {
        key: 'fileType',
        label: 'File Type',
        type: 'select',
        multiple: true,
        options: [
            { label: 'Images', value: 'IMAGE' },
            { label: 'Videos', value: 'VIDEO' },
            { label: 'Documents', value: 'DOCUMENT' },
            { label: 'Audio', value: 'AUDIO' },
            { label: 'Other', value: 'OTHER' },
        ]
    },
];

const FileIcon = ({ type }: { type: string }) => {
    switch (type) {
        case 'IMAGE': return <ImageIcon className="text-purple-500" />;
        case 'VIDEO': return <Film className="text-blue-500" />;
        case 'AUDIO': return <Music className="text-pink-500" />;
        case 'DOCUMENT': return <FileText className="text-orange-500" />;
        case 'DIRECTORY': return <Folder className="text-yellow-500 fill-yellow-500/20" />;
        default: return <File className="text-gray-400" />;
    }
};

const formatSize = (bytes?: number) => {
    if (!bytes && bytes !== 0) return '0 B';
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const FileManager = () => {
    const [files, setFiles] = useState<IFileStorage[]>([]);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchParams, setSearchParams] = useSearchParams();
    const [filters, setFilters] = useState<IFileStorageFilters>({});
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [currentPath, setCurrentPath] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Popup Modal State
    const [popup, setPopup] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'alert' | 'confirm' | 'prompt';
        inputValue?: string;
        onConfirm: () => void;
        loading?: boolean;
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'alert',
        onConfirm: () => { }
    });

    const fetchFiles = async () => {
        try {
            setLoading(true);
            const queryFilters: any = { ...filters };
            searchParams.forEach((value, key) => {
                if (key === 'fileType' && value.includes(',')) {
                    queryFilters[key] = value.split(',');
                } else if (key === 'search' && value) {
                    queryFilters[key] = value;
                }
            });

            if (!queryFilters.search) {
                if (!currentPath) {
                    queryFilters.storageDirPath = undefined;
                } else {
                    // const parts = currentPath.split('/');
                    // parts.pop();
                    queryFilters.storageDirPath = [currentPath]
                }
            }

            const response = await fileStorageService.getAll(queryFilters);
            if (response && response.data) {
                const { dirList, fileList } = response.data as any;

                if (dirList !== undefined && fileList !== undefined) {
                    const normalizedDirs = dirList.map((d: any) => ({
                        ...d,
                        originalFileName: d.originalFileName || d.name || 'Untitled Folder',
                        fileType: d.fileType || 'DIRECTORY',
                        storageDirPath: d.storageDirPath !== undefined ? d.storageDirPath : d.parentPath,
                        storageFileName: d.storageFileName || d.name,
                        fileSize: d.fileSize || 0,
                    }));
                    setFiles([...normalizedDirs, ...fileList]);
                } else if (Array.isArray(response.data)) {
                    setFiles(response.data);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, [searchParams, filters, currentPath]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        setSearchParams(prev => {
            if (term) prev.set('search', term);
            else prev.delete('search');
            return prev;
        });
    };

    const handleFilterApply = (newFilters: Record<string, any>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        try {
            setUploading(true);
            const storageDirPath = currentPath || '';
            let storageDir = '';

            if (storageDirPath) {
                const parts = storageDirPath.split('/');
                storageDir = parts[parts.length - 1];
            }

            await fileStorageService.upload(Array.from(e.target.files), storageDirPath, storageDir);
            fetchFiles();
        } catch (err) {
            console.error('Upload failed', err);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDelete = async (id: string) => {
        setPopup({
            isOpen: true,
            title: 'Delete Item',
            message: 'Are you sure you want to delete this file/folder? This action cannot be undone.',
            type: 'confirm',
            onConfirm: async () => {
                try {
                    setPopup(prev => ({ ...prev, loading: true }));
                    await fileStorageService.delete(id);
                    fetchFiles();
                    setPopup(prev => ({ ...prev, isOpen: false, loading: false }));
                } catch (err) {
                    console.error(err);
                    setPopup(prev => ({ ...prev, loading: false }));
                }
            }
        });
    };

    const handleCreateFolder = async () => {
        setPopup({
            isOpen: true,
            title: 'Create Folder',
            message: 'Enter a name for the new folder:',
            type: 'prompt',
            inputValue: '',
            onConfirm: async () => {
                const name = popup.inputValue;
                if (!name) return;
                try {
                    setPopup(prev => ({ ...prev, loading: true }));
                    await fileStorageService.createFolder(name, currentPath);
                    fetchFiles();
                    setPopup(prev => ({ ...prev, isOpen: false, loading: false }));
                } catch (err) {
                    console.error(err);
                    setPopup(prev => ({ ...prev, loading: false }));
                }
            }
        });
    };

    const handleMove = async (file: IFileStorage) => {
        setPopup({
            isOpen: true,
            title: 'Move Item',
            message: `Enter destination path for '${file.originalFileName}' (leave empty for root):`,
            type: 'prompt',
            inputValue: file.storageDirPath || '',
            onConfirm: async () => {
                const newPath = popup.inputValue || '';
                if (newPath === (file.storageDirPath || '')) {
                    setPopup(prev => ({ ...prev, isOpen: false }));
                    return;
                }

                try {
                    setPopup(prev => ({ ...prev, loading: true }));
                    await fileStorageService.moveFile(file._id, newPath);
                    fetchFiles();
                    setPopup(prev => ({ ...prev, isOpen: false, loading: false }));
                } catch (err) {
                    console.error('Move failed', err);
                    setPopup(prev => ({ ...prev, loading: false }));
                }
            }
        });
    };

    const navigateToFolder = (folder: any) => {
        const path = folder.path || (folder.storageDirPath ? `${folder.storageDirPath}/${folder.storageFileName}` : folder.storageFileName);
        setCurrentPath(path);
    };

    const navigateUp = () => {
        if (!currentPath) return;
        if (!currentPath.includes('/')) {
            setCurrentPath(''); // Back to root
            return;
        }
        const parts = currentPath.split('/');
        parts.pop();
        const newPath = parts.join('/');
        setCurrentPath(newPath);
    };

    return (
        <div className="flex flex-col h-full bg-gray-50/50 p-6 space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    {currentPath && (
                        <button
                            onClick={navigateUp}
                            className="p-2.5 bg-white border border-gray-200 text-gray-400 hover:text-primary hover:border-primary/20 rounded-xl transition-all shadow-sm group"
                            title="Go up"
                        >
                            <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                    )}
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">File Manager</h1>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleCreateFolder}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        <FolderPlus className="text-yellow-500" size={20} />
                        New Folder
                    </button>

                    <CustomButton
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="shadow-xl shadow-primary/20"
                    >
                        {uploading ? <RefreshCw className="animate-spin mr-2" /> : <Upload className="mr-2" size={20} />}
                        Upload
                    </CustomButton>
                    <input
                        type="file"
                        multiple
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleUpload}
                    />
                </div>
            </div>

            {/* Toolkit Bar */}
            <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search files..."
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-primary/20 rounded-2xl outline-none transition-all font-bold text-gray-700"
                        onChange={handleSearch}
                        defaultValue={searchParams.get('search') || ''}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'text-gray-400 hover:bg-gray-100'}`}
                    >
                        <Grid size={20} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'text-gray-400 hover:bg-gray-100'}`}
                    >
                        <ListIcon size={20} />
                    </button>
                    <div className="w-px h-8 bg-gray-200 mx-2" />
                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all ${Object.keys(filters).length > 0 ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                    >
                        <Filter size={18} />
                        <span className="text-sm">Filter</span>
                    </button>
                </div>
            </div>

            {/* Breadcrumb Navigation Card */}
            <div className="bg-white px-6 py-3.5 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
                <button
                    onClick={() => setCurrentPath('')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all shrink-0 ${!currentPath ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}
                >
                    <Home size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest px-0.5">Home</span>
                </button>

                {currentPath.split('/').filter(Boolean).map((part, idx, arr) => (
                    <React.Fragment key={idx}>
                        <ChevronRight size={14} className="text-gray-300 shrink-0" />
                        <button
                            onClick={() => setCurrentPath(arr.slice(0, idx + 1).join('/'))}
                            className={`px-4 py-2 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest shrink-0 whitespace-nowrap ${idx === arr.length - 1 ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}
                        >
                            {part}
                        </button>
                    </React.Fragment>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto min-h-[500px]">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                            <p className="text-gray-400 font-bold animate-pulse">Loading files...</p>
                        </div>
                    </div>
                ) : files.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                            <Folder size={48} className="text-gray-300" />
                        </div>
                        <p className="font-bold text-lg">No files found</p>
                        <p className="text-gray-400 text-sm">Folder is empty</p>
                    </div>
                ) : (
                    <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4' : 'flex flex-col gap-2'}>
                        {files.map(file => (
                            <FileItem
                                key={file._id}
                                file={file}
                                viewMode={viewMode}
                                onDelete={handleDelete}
                                onNavigate={navigateToFolder}
                                onMove={handleMove}
                            />
                        ))}
                    </div>
                )}
            </div>

            <CommonFilter
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                fields={filterFields}
                onApply={handleFilterApply}
                currentFilters={filters}
            />

            <PopupModal
                isOpen={popup.isOpen}
                onClose={() => setPopup(prev => ({ ...prev, isOpen: false }))}
                title={popup.title}
                message={popup.message}
                type={popup.type}
                inputValue={popup.inputValue}
                onInputChange={(val) => setPopup(prev => ({ ...prev, inputValue: val }))}
                onConfirm={popup.onConfirm}
                loading={popup.loading}
            />
        </div>
    );
};

interface FileItemProps {
    file: IFileStorage;
    viewMode: 'grid' | 'list';
    onDelete: (id: string) => void;
    onNavigate: (folder: IFileStorage) => void;
    onMove: (file: IFileStorage) => void;
}

const FileItem = ({ file, viewMode, onDelete, onNavigate, onMove }: FileItemProps) => {
    const isDir = file.fileType === 'DIRECTORY';

    const handleClick = () => {
        if (isDir) onNavigate(file);
        else if (file.preSignedUrl) window.open(file.preSignedUrl, '_blank');
    };

    return viewMode === 'grid' ? (
        <div className="group relative bg-white p-4 rounded-[1.5rem] border border-gray-100 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col gap-3">
            <div
                className="aspect-square bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden relative cursor-pointer"
                onClick={handleClick}
            >
                {file.fileType === 'IMAGE' && file.preSignedUrl ? (
                    <img src={file.preSignedUrl} alt={file.originalFileName} className="w-full h-full object-cover" />
                ) : (
                    <FileIcon type={file.fileType} />
                )}

                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]" onClick={(e) => e.stopPropagation()}>
                    {!isDir && (
                        <button
                            onClick={() => onMove(file)}
                            className="p-2 bg-white/20 hover:bg-white text-white hover:text-primary rounded-xl backdrop-blur-md transition-all scale-0 group-hover:scale-100 delay-75"
                            title="Move"
                        >
                            <Move size={18} />
                        </button>
                    )}
                    <button
                        onClick={() => onDelete(file._id)}
                        className="p-2 bg-white/20 hover:bg-white text-white hover:text-red-500 rounded-xl backdrop-blur-md transition-all scale-0 group-hover:scale-100 delay-100"
                        title="Delete"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
            <div>
                <p
                    className="font-bold text-gray-800 text-sm truncate cursor-pointer hover:text-primary"
                    title={file.originalFileName}
                    onClick={handleClick}
                >
                    {file.originalFileName}
                </p>
                <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{file.fileExtension?.replace('.', '') || 'DIR'}</span>
                    <span className="text-[10px] font-bold text-gray-400">{formatSize(file.fileSize)}</span>
                </div>
            </div>
        </div>
    ) : (
        <div className="group bg-white p-4 rounded-2xl border border-gray-100 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all flex items-center gap-4">
            <div
                className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 overflow-hidden cursor-pointer"
                onClick={handleClick}
            >
                {file.fileType === 'IMAGE' && file.preSignedUrl ? (
                    <img src={file.preSignedUrl} alt={file.originalFileName} className="w-full h-full object-cover" />
                ) : (
                    <FileIcon type={file.fileType} />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p
                    className="font-bold text-gray-800 truncate cursor-pointer hover:text-primary"
                    onClick={handleClick}
                >
                    {file.originalFileName}
                </p>
                <p className="text-xs font-medium text-gray-400 mt-0.5">{file.cloudType} • {formatSize(file.fileSize)}</p>
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity px-2">
                {!isDir && (
                    <button
                        onClick={() => onMove(file)}
                        className="p-2 hover:bg-gray-100 text-gray-500 hover:text-primary rounded-xl transition-colors"
                        title="Move"
                    >
                        <Move size={18} />
                    </button>
                )}
                {!isDir && file.preSignedUrl && (
                    <a
                        href={file.preSignedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-gray-100 text-gray-500 hover:text-primary rounded-xl transition-colors"
                    >
                        <Download size={18} />
                    </a>
                )}
                <button
                    onClick={() => onDelete(file._id)}
                    className="p-2 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-xl transition-colors"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
};
