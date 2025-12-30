import { X, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { userService } from '../../../api/services/user.service';
import type { IUser } from '../../../types';
import { Button } from '../../../components/common/Button';

interface DeleteUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    user: IUser | null;
}

const DeleteUserModal = ({ isOpen, onClose, onSuccess, user }: DeleteUserModalProps) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleDelete = async () => {
        if (!user) return;

        setLoading(true);
        setError('');

        try {
            await userService.deleteByFilter({ _id: user._id });
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete user');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-surface border border-red-500/20 rounded-3xl p-8 w-full max-w-md shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-500/10 rounded-xl">
                            <AlertTriangle className="w-6 h-6 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-black text-text-primary">Delete User</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-surface-hover rounded-xl transition-colors"
                    >
                        <X className="w-5 h-5 text-text-secondary" />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                        <p className="text-xs font-bold text-red-500 uppercase tracking-tight">
                            {error}
                        </p>
                    </div>
                )}

                <div className="mb-6 space-y-3">
                    <p className="text-text-secondary">
                        Are you sure you want to delete this user? This action cannot be undone.
                    </p>
                    <div className="p-4 bg-surface-hover/50 rounded-xl space-y-1 border border-border/50">
                        <p className="text-sm text-text-secondary">User Details:</p>
                        <p className="text-text-primary font-bold">
                            {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-text-secondary">{user.email}</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button
                        type="button"
                        onClick={onClose}
                        variant="secondary"
                        className="flex-1"
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleDelete}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                        isLoading={loading}
                    >
                        Delete User
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DeleteUserModal;
