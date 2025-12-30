import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { categoryService } from '../../../api/services/category.service'; // Assuming available
import { Table, Button, type Column } from '../../../components/common';
import { CreditCard, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

const PaymentConfigList = () => {
    const navigate = useNavigate();
    // Simplified logic: fetching configs is tricky as it depends on entity ID.
    // For this list view, we might want to list Categories and their configs.
    // Given the constraints, I will build a conceptual list or simple redirect to form for specific entities.
    // Better approach: List Categories and show their payment status.

    // START SIMULATION: Since getting ALL configs might not be straightforward without a specific endpoint returning all configs,
    // we'll fetch categories products and show config status if possible, or just a simple setup to add config.
    // For MVP, filter by entity type? Or just show a "Configure" button that leads to a form selector.

    // Let's implement a Category Payment Config list for now as it's high level.
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await categoryService.getTree(); // Fetch tree
            // access res.data directly if it returns array, or wrap
            const list = Array.isArray(res.data) ? res.data : [];
            setCategories(list);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleConfigure = (category: any) => {
        navigate(`/settings/payment-config/category/${category._id}`);
    };

    const columns: Column<any>[] = [
        { key: 'name', header: 'Category', width: '40%' },
        {
            key: 'slug',
            header: 'Slug',
            width: '30%',
            render: (row) => <span className="text-text-secondary">{row.slug}</span>
        },
        {
            key: 'actions',
            header: 'Configuration',
            align: 'right',
            render: (row) => (
                <div className="flex justify-end onClick={(e) => e.stopPropagation()}">
                    <Button
                        onClick={() => handleConfigure(row)}
                        variant="secondary"
                        className="!p-1.5 text-xs flex items-center gap-1"
                    >
                        <CreditCard size={14} /> Configure Payment
                    </Button>
                </div>
            ),
        }
    ];

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Payment Configuration</h1>
                    <p className="text-text-secondary text-sm">Set COD and Prepayment rules per category.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => fetchCategories()} className="!p-2.5">
                        <RefreshCw size={18} />
                    </Button>
                </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg text-blue-600 dark:text-blue-400 text-sm mb-4 font-medium">
                <p>Note: Payment configurations can be set at the Category level. Product level overrides are available in the Product settings.</p>
            </div>

            <Table<any>
                data={categories}
                columns={columns}
                isLoading={loading}
                emptyMessage="No categories found."
            />
        </div>
    );
};

export default PaymentConfigList;
