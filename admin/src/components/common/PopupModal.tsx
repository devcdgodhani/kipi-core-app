import React from 'react';
import { Modal } from './Modal';
import CustomButton from './Button';
import Input from './Input';

interface PopupModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: 'alert' | 'confirm' | 'prompt';
    inputValue?: string;
    onInputChange?: (val: string) => void;
    onConfirm: (value?: string) => void;
    confirmLabel?: string;
    cancelLabel?: string;
    loading?: boolean;
}

export const PopupModal: React.FC<PopupModalProps> = ({
    isOpen,
    onClose,
    title,
    message,
    type = 'alert',
    inputValue,
    onInputChange,
    onConfirm,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    loading = false
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="space-y-6">
                <p className="text-gray-600 font-medium">{message}</p>

                {type === 'prompt' && (
                    <Input
                        value={inputValue || ''}
                        onChange={(e) => onInputChange?.(e.target.value)}
                        placeholder="Type here..."
                        autoFocus
                    />
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                    {type !== 'alert' && (
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all text-sm uppercase tracking-widest"
                        >
                            {cancelLabel}
                        </button>
                    )}
                    <CustomButton
                        onClick={() => onConfirm(inputValue)}
                        disabled={loading || (type === 'prompt' && !inputValue?.trim())}
                        className="min-w-[120px]"
                    >
                        {loading ? 'Processing...' : confirmLabel}
                    </CustomButton>
                </div>
            </div>
        </Modal>
    );
};
