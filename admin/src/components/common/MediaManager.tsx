import React, { useState, useRef } from 'react';
import { Trash2, Plus, MoveUp, MoveDown, Image as ImageIcon, Video, Youtube, Upload, FolderOpen, RefreshCw } from 'lucide-react';
import { MEDIA_FILE_TYPE, MEDIA_TYPE, MEDIA_STATUS, type IMedia } from '../../types/media';
import { fileStorageService } from '../../services/fileStorage.service';
import { FileManagerSelector } from './FileManagerSelector';

interface MediaManagerProps {
    media: IMedia[];
    onChange: (media: IMedia[]) => void;
    productCode?: string;
    skuCode?: string;
}

export const MediaManager: React.FC<MediaManagerProps> = ({ media, onChange, productCode, skuCode }) => {
    const [isFileManagerOpen, setIsFileManagerOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAdd = () => {
        const newItem: IMedia = {
            fileType: MEDIA_FILE_TYPE.IMAGE,
            type: MEDIA_TYPE.FULL,
            url: '',
            status: MEDIA_STATUS.ACTIVE,
            sortOrder: media.length
        };
        onChange([...media, newItem]);
    };

    const handleRemove = (index: number) => {
        const newMedia = media.filter((_, i) => i !== index);
        onChange(newMedia);
    };

    const handleChange = (index: number, field: keyof IMedia, value: any) => {
        const newMedia = [...media];
        newMedia[index] = { ...newMedia[index], [field]: value };
        onChange(newMedia);
    };

    const handleMove = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === media.length - 1) return;

        const newMedia = [...media];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        [newMedia[index], newMedia[swapIndex]] = [newMedia[swapIndex], newMedia[index]];

        // Update sortOrder
        const finalMedia = newMedia.map((item, idx) => ({ ...item, sortOrder: idx }));
        onChange(finalMedia);
    };

    const handleDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        if (!productCode) {
            alert('Please provide product code first before direct uploading assets.');
            return;
        }

        try {
            setUploading(true);
            const storageDir = skuCode || productCode;
            const storageDirPath = skuCode ? `product/${productCode}/${skuCode}` : `product/${productCode}`;

            const res = await fileStorageService.upload(
                Array.from(e.target.files),
                storageDirPath,
                storageDir
            );

            if (res.data && Array.isArray(res.data)) {
                const newAssets: IMedia[] = res.data.map((file, idx) => ({
                    fileType: MEDIA_FILE_TYPE.IMAGE,
                    type: MEDIA_TYPE.FULL,
                    fileStorageId: file._id,
                    url: file.preSignedUrl || '',
                    status: MEDIA_STATUS.ACTIVE,
                    sortOrder: media.length + idx
                }));
                onChange([...media, ...newAssets]);
            }
        } catch (err) {
            console.error('Failed to upload assets', err);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleFileSelect = (file: any) => {
        const newItem: IMedia = {
            fileType: MEDIA_FILE_TYPE.IMAGE,
            type: MEDIA_TYPE.FULL,
            fileStorageId: file._id,
            url: file.preSignedUrl || '',
            status: MEDIA_STATUS.ACTIVE,
            sortOrder: media.length
        };
        onChange([...media, newItem]);
        setIsFileManagerOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-1 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Media Collection</label>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Manage product imagery and video assets</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleAdd}
                        className="flex items-center gap-2 px-5 py-3 bg-white text-gray-500 border border-gray-100 rounded-[1.2rem] text-[9px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm active:scale-95"
                    >
                        <Plus size={14} /> Add Manual
                    </button>

                    <div className="relative group/upload">
                        <button
                            type="button"
                            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
                        >
                            {uploading ? <RefreshCw size={14} className="animate-spin" /> : <Upload size={14} />}
                            Upload File
                        </button>

                        {/* Dropdown Options */}
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 opacity-0 invisible group-hover/upload:opacity-100 group-hover/upload:visible transition-all z-20 py-2">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                            >
                                <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    <Upload size={14} />
                                </div>
                                <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Direct Upload</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsFileManagerOpen(true)}
                                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                            >
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                                    <FolderOpen size={14} />
                                </div>
                                <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Browse Gallery</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <input
                type="file"
                multiple
                ref={fileInputRef}
                onChange={handleDirectUpload}
                className="hidden"
                accept="image/*,video/*"
            />

            <div className="grid grid-cols-1 gap-4">
                {media.length === 0 ? (
                    <div className="py-20 text-center bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-100 flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <ImageIcon size={32} className="text-gray-200" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Vault is Empty</p>
                            <p className="text-[9px] text-gray-400 font-medium">No media assets have been synchronized with this product</p>
                        </div>
                    </div>
                ) : (
                    media.map((item, idx) => (
                        <div key={idx} className="group bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all flex flex-col sm:flex-row gap-8 items-start sm:items-center animate-in fade-in slide-in-from-bottom-2">
                            {/* Preview */}
                            <div className="w-full sm:w-40 h-40 rounded-[2rem] bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-500">
                                {(() => {
                                    const displayUrl = typeof item.fileStorageId === 'object' ? item.fileStorageId?.preSignedUrl : item.url;
                                    if (!displayUrl) {
                                        return (
                                            <div className="flex flex-col items-center gap-2 text-gray-200">
                                                <ImageIcon size={36} />
                                                <span className="text-[8px] font-black uppercase tracking-widest">Pending Sync</span>
                                            </div>
                                        );
                                    }
                                    if (item.fileType === MEDIA_FILE_TYPE.IMAGE) {
                                        return <img src={displayUrl} alt="Media Preview" className="w-full h-full object-cover" />;
                                    }
                                    return (
                                        <div className="flex flex-col items-center gap-2 text-gray-400">
                                            {item.fileType === MEDIA_FILE_TYPE.VIDEO ? <Video size={36} className="text-indigo-400" /> : <Youtube size={36} className="text-rose-400" />}
                                            <span className="text-[9px] font-black uppercase tracking-widest">{item.fileType}</span>
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Controls */}
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 w-full">
                                <div className="space-y-2 col-span-full">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                            {item.fileType === MEDIA_FILE_TYPE.YOUTUBE ? 'YouTube URL' : 'Asset Source URL'}
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Format</label>
                                            <select
                                                value={item.fileType}
                                                onChange={(e) => handleChange(idx, 'fileType', e.target.value)}
                                                className="border-none bg-transparent hover:bg-gray-100 rounded-lg p-1 focus:outline-none font-black text-primary text-[10px] uppercase tracking-widest"
                                            >
                                                {Object.values(MEDIA_FILE_TYPE).map(ft => (
                                                    <option key={ft} value={ft}>{ft}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            value={item.url}
                                            onChange={(e) => handleChange(idx, 'url', e.target.value)}
                                            className="flex-1 border-2 border-gray-100 bg-gray-50 rounded-2xl py-4 px-5 focus:outline-none focus:border-primary/30 transition-all font-bold text-gray-700 text-xs shadow-sm"
                                            placeholder={item.fileType === MEDIA_FILE_TYPE.YOUTUBE ? "https://youtube.com/watch?v=..." : "https://cloud.storage.com/asset.jpg"}
                                        />
                                        {item.fileStorageId && (
                                            <div className="px-4 bg-gray-50 rounded-2xl border-2 border-gray-100 flex items-center justify-center" title="Synced with File Manager">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {item.fileType !== MEDIA_FILE_TYPE.YOUTUBE && (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Angle / Perspective</label>
                                            <select
                                                value={item.type}
                                                onChange={(e) => handleChange(idx, 'type', e.target.value)}
                                                className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl py-4 px-5 focus:outline-none focus:border-primary/30 transition-all font-black text-gray-700 text-[10px] uppercase tracking-widest"
                                            >
                                                {Object.values(MEDIA_TYPE).map(t => (
                                                    <option key={t} value={t}>{t}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Status</label>
                                            <select
                                                value={item.status}
                                                onChange={(e) => handleChange(idx, 'status', e.target.value)}
                                                className="w-full border-2 border-gray-100 bg-gray-50 rounded-2xl py-4 px-5 focus:outline-none focus:border-primary/30 transition-all font-black text-gray-700 text-[10px] uppercase tracking-widest"
                                            >
                                                {Object.values(MEDIA_STATUS).map(s => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-row sm:flex-col gap-3 shrink-0 bg-gray-50 p-2 rounded-2xl border border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => handleMove(idx, 'up')}
                                    disabled={idx === 0}
                                    title="Move Up"
                                    className="p-3 text-gray-400 hover:text-primary hover:bg-white rounded-xl disabled:opacity-20 transition-all shadow-sm active:scale-90"
                                >
                                    <MoveUp size={16} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleMove(idx, 'down')}
                                    disabled={idx === media.length - 1}
                                    title="Move Down"
                                    className="p-3 text-gray-400 hover:text-primary hover:bg-white rounded-xl disabled:opacity-20 transition-all shadow-sm active:scale-90"
                                >
                                    <MoveDown size={16} />
                                </button>
                                <div className="h-px bg-gray-200 w-full hidden sm:block mx-1"></div>
                                <button
                                    type="button"
                                    onClick={() => handleRemove(idx)}
                                    title="Eject Asset"
                                    className="p-3 text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all active:scale-90"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <FileManagerSelector
                isOpen={isFileManagerOpen}
                onClose={() => setIsFileManagerOpen(false)}
                onSelect={handleFileSelect}
            />
        </div>
    );
};
