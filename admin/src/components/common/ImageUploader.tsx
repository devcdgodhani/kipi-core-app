import React, { useRef, useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { uploadService } from '../../api/services/upload.service';
import { toast } from 'react-hot-toast';

interface ImageUploaderProps {
    images: string[];
    onChange: (images: string[]) => void;
    maxFiles?: number;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ images = [], onChange, maxFiles = 5 }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (images.length + files.length > maxFiles) {
            toast.error(`You can only upload up to ${maxFiles} images`);
            return;
        }

        setUploading(true);
        const newImages = [...images];

        try {
            // Upload sequentially or parallel
            const uploadPromises = Array.from(files).map(file => uploadService.uploadImage(file));
            const responses = await Promise.all(uploadPromises);

            responses.forEach(res => {
                if (res.data?.url) {
                    newImages.push(res.data.url);
                }
            });

            onChange(newImages);
            toast.success('Images uploaded successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to upload images');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        onChange(newImages);
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((img, idx) => (
                    <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-border bg-surface">
                        <img src={img} alt={`Product ${idx}`} className="w-full h-full object-cover" />
                        <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-2 right-2 p-1.5 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}

                {images.length < maxFiles && (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`aspect-square rounded-xl border-2 border-dashed border-border hover:border-brand-500 hover:bg-surface-hover flex flex-col items-center justify-center cursor-pointer transition-all ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                        {uploading ? (
                            <Loader2 className="animate-spin text-brand-500 mb-2" />
                        ) : (
                            <Upload className="text-text-secondary mb-2 group-hover:text-brand-500" />
                        )}
                        <span className="text-xs font-bold text-text-secondary">
                            {uploading ? 'Uploading...' : 'Upload Image'}
                        </span>
                    </div>
                )}
            </div>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                multiple
                accept="image/*"
                onChange={handleFileChange}
            />
        </div>
    );
};
