import React, { useEffect, useState } from 'react';
import {
    Folder, File, Image as ImageIcon, Film, Music, FileText,
    Search, Grid, List as ListIcon,
    ChevronRight, Home, ArrowLeft
} from 'lucide-react';
import { fileStorageService } from '../../services/fileStorage.service';
import type { IFileStorage } from '../../types/fileStorage';
import { Modal } from './Modal';

interface FileManagerSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (item: any) => void;
    selectionMode?: 'file' | 'directory';
    title?: string;
}

export const FileManagerSelector: React.FC<FileManagerSelectorProps> = ({
    isOpen,
    onClose,
    onSelect,
    selectionMode = 'file',
    title = 'Select File from Storage'
}) => {
    const [files, setFiles] = useState<IFileStorage[]>([]);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPath, setCurrentPath] = useState('');

    const fetchFiles = async () => {
        try {
            setLoading(true);
            const queryFilters: any = {};
            if (searchTerm) {
                queryFilters.search = searchTerm;
            } else {
                if (!currentPath) {
                    queryFilters.storageDirPath = undefined;
                } else {
                    queryFilters.storageDirPath = [currentPath]
                }
            }

            const response = await fileStorageService.getAll(queryFilters);
            if (response && response.data) {
                const { dirList, fileList } = response.data as any;
                if (dirList !== undefined && fileList !== undefined) {
                    const normalizedDirs = dirList.map((d: any) => ({
                        ...d,
                        originalFileName: d.name || d.originalFileName || 'Untitled Folder',
                        fileType: 'DIRECTORY',
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
        if (isOpen) {
            fetchFiles();
        }
    }, [isOpen, searchTerm, currentPath]);

    const navigateToFolder = (folder: any) => {
        const path = folder.path || (folder.storageDirPath ? `${folder.storageDirPath}/${folder.storageFileName}` : folder.storageFileName);
        setCurrentPath(path);
    };

    const navigateUp = () => {
        if (!currentPath) return;
        const parts = currentPath.split('/');
        parts.pop();
        setCurrentPath(parts.join('/'));
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-4xl">
            <div className="flex flex-col h-[600px] w-full -m-6">
                {/* Toolkit Bar */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
                    {selectionMode === 'directory' && (
                        <button
                            onClick={() => onSelect({ path: currentPath })}
                            className="px-4 py-2 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all text-sm flex items-center gap-2 shrink-0"
                        >
                            <Folder size={18} />
                            Select {currentPath ? 'This' : 'Root'} Folder
                        </button>
                    )}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search files..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-transparent focus:bg-white focus:border-primary/20 border-2 rounded-xl outline-none transition-all text-sm font-bold"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-100'}`}
                        >
                            <Grid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-100'}`}
                        >
                            <ListIcon size={18} />
                        </button>
                    </div>
                </div>

                {/* Breadcrumb */}
                <div className="px-4 py-2 border-b border-gray-50 flex items-center gap-2 overflow-x-auto no-scrollbar bg-gray-50/50">
                    <button
                        onClick={() => setCurrentPath('')}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${!currentPath ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <Home size={14} />
                    </button>
                    {currentPath.split('/').filter(Boolean).map((part, idx, arr) => (
                        <React.Fragment key={idx}>
                            <ChevronRight size={12} className="text-gray-300" />
                            <button
                                onClick={() => setCurrentPath(arr.slice(0, idx + 1).join('/'))}
                                className="px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600"
                            >
                                {part}
                            </button>
                        </React.Fragment>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                        </div>
                    ) : files.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                            <Folder size={32} className="opacity-20" />
                            <p className="text-xs font-bold uppercase tracking-widest">No files found</p>
                        </div>
                    ) : (
                        <div className={viewMode === 'grid' ? 'grid grid-cols-4 sm:grid-cols-5 gap-4' : 'flex flex-col gap-1'}>
                            {currentPath && (
                                <div
                                    onClick={navigateUp}
                                    className="cursor-pointer p-3 rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 hover:bg-gray-50 transition-colors"
                                >
                                    <ArrowLeft size={20} className="text-gray-300" />
                                    <span className="text-[8px] font-black uppercase text-gray-400">Back</span>
                                </div>
                            )}
                            {files.map(file => (
                                <div
                                    key={file._id}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (file.fileType === 'DIRECTORY') {
                                            navigateToFolder(file);
                                        } else if (selectionMode === 'file') {
                                            onSelect(file);
                                        }
                                    }}
                                    className={`group cursor-pointer p-3 rounded-xl border transition-all ${file.fileType !== 'DIRECTORY' && selectionMode === 'directory' ? 'opacity-40 grayscale pointer-events-none' : ''
                                        } ${viewMode === 'grid'
                                            ? 'flex flex-col items-center gap-2 border-gray-50 hover:border-primary/20 hover:shadow-lg'
                                            : 'flex items-center gap-3 border-transparent hover:bg-gray-50'
                                        }`}
                                >
                                    <div className={`${viewMode === 'grid' ? 'w-full aspect-square' : 'w-10 h-10'} rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden shrink-0`}>
                                        {file.fileType === 'IMAGE' && file.preSignedUrl ? (
                                            <img src={file.preSignedUrl} alt={file.originalFileName} className="w-full h-full object-cover" />
                                        ) : (
                                            <FileIcon type={file.fileType} />
                                        )}
                                    </div>
                                    <div className={viewMode === 'grid' ? 'w-full text-center mt-auto' : 'flex-1 min-w-0'}>
                                        <p className="text-[11px] font-bold text-gray-700 truncate px-1" title={file.originalFileName}>
                                            {file.originalFileName}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

const FileIcon = ({ type }: { type: string }) => {
    switch (type) {
        case 'IMAGE': return <ImageIcon size={20} className="text-purple-500" />;
        case 'VIDEO': return <Film size={20} className="text-blue-500" />;
        case 'AUDIO': return <Music size={20} className="text-pink-500" />;
        case 'DOCUMENT': return <FileText size={20} className="text-orange-500" />;
        case 'DIRECTORY': return <Folder size={20} className="text-yellow-500 fill-yellow-500/10" />;
        default: return <File size={20} className="text-gray-400" />;
    }
};
