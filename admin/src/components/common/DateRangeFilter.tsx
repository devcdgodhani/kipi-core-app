import React, { useState } from 'react';
import { Calendar, ChevronDown, Check } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

export type DateRange = {
    startDate: Date;
    endDate: Date;
    key: string;
};

interface DateRangeFilterProps {
    onChange: (range: DateRange) => void;
    initialRangeKey?: string;
}

const PREDEFINED_RANGES = [
    { label: 'Today', getValue: () => ({ start: startOfDay(new Date()), end: endOfDay(new Date()) }), key: 'today' },
    { label: 'Last 7 Days', getValue: () => ({ start: startOfDay(subDays(new Date(), 7)), end: endOfDay(new Date()) }), key: '7d' },
    { label: 'Last 30 Days', getValue: () => ({ start: startOfDay(subDays(new Date(), 30)), end: endOfDay(new Date()) }), key: '30d' },
    { label: 'Last 90 Days', getValue: () => ({ start: startOfDay(subDays(new Date(), 90)), end: endOfDay(new Date()) }), key: '90d' },
];

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ onChange, initialRangeKey = '30d' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedKey, setSelectedKey] = useState(initialRangeKey);
    const [isCustom, setIsCustom] = useState(initialRangeKey === 'custom');
    const [customStart, setCustomStart] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
    const [customEnd, setCustomEnd] = useState(format(new Date(), 'yyyy-MM-dd'));

    // Robust Sync: Update internal state when props change
    React.useEffect(() => {
        if (initialRangeKey !== selectedKey) {
            setSelectedKey(initialRangeKey);
            setIsCustom(initialRangeKey === 'custom');
        }
    }, [initialRangeKey]);

    const handleRangeSelect = (range: typeof PREDEFINED_RANGES[0]) => {
        const { start, end } = range.getValue();
        setSelectedKey(range.key);
        setIsCustom(false);
        setIsOpen(false);
        onChange({ startDate: start, endDate: end, key: range.key });
    };

    const handleCustomApply = () => {
        const start = startOfDay(new Date(customStart));
        const end = endOfDay(new Date(customEnd));
        setSelectedKey('custom');
        setIsCustom(true);
        setIsOpen(false);
        onChange({ startDate: start, endDate: end, key: 'custom' });
    };

    const getDisplayLabel = () => {
        if (isCustom) {
            return `${format(new Date(customStart), 'MMM d')} - ${format(new Date(customEnd), 'MMM d, yyyy')}`;
        }
        const range = PREDEFINED_RANGES.find(r => r.key === selectedKey);
        return range ? range.label : 'Select Range';
    };

    return (
        <div className="relative z-[60]">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-4 bg-white border border-gray-100 rounded-[1.5rem] px-5 h-14 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_15px_40px_rgb(0,0,0,0.1)] hover:border-primary/30 transition-all group relative z-20"
            >
                <div className="w-9 h-9 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 relative z-10">
                    <Calendar size={18} />
                </div>
                <div className="flex flex-col items-start min-w-[110px] relative z-10 text-left">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] leading-none mb-1.5">Reporting Period</span>
                    <span className="text-xs font-black text-gray-800 uppercase tracking-tight group-hover:text-primary transition-colors">{getDisplayLabel()}</span>
                </div>
                <div className="w-px h-6 bg-gray-200 mx-1 relative z-10" />
                <ChevronDown size={14} className={`text-gray-400 transition-transform duration-500 relative z-10 ${isOpen ? 'rotate-180 text-primary' : 'group-hover:text-primary'}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full mt-3 right-0 w-72 bg-white rounded-[2rem] border border-gray-100 shadow-[0_30px_70px_rgba(0,0,0,0.2)] p-4 z-[100] animate-in fade-in slide-in-from-top-4 duration-500 ease-out">
                    <div className="space-y-1 mb-4">
                        {PREDEFINED_RANGES.map((range) => (
                            <button
                                key={range.key}
                                onClick={() => handleRangeSelect(range)}
                                className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-primary/5 transition-colors group"
                            >
                                <span className={`text-xs font-bold ${selectedKey === range.key && !isCustom ? 'text-primary' : 'text-gray-600'}`}>
                                    {range.label}
                                </span>
                                {selectedKey === range.key && !isCustom && (
                                    <Check size={14} className="text-primary" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="border-t border-gray-100 pt-4 px-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-2">Custom Range</p>
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1 text-left">
                                    <label className="text-[9px] font-bold text-gray-400 uppercase ml-1">Start</label>
                                    <input
                                        type="date"
                                        value={customStart}
                                        onChange={(e) => setCustomStart(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-lg p-2 text-[10px] font-bold text-gray-700 outline-none focus:border-primary/40 transition-colors"
                                    />
                                </div>
                                <div className="space-y-1 text-left">
                                    <label className="text-[9px] font-bold text-gray-400 uppercase ml-1">End</label>
                                    <input
                                        type="date"
                                        value={customEnd}
                                        onChange={(e) => setCustomEnd(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-lg p-2 text-[10px] font-bold text-gray-700 outline-none focus:border-primary/40 transition-colors"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleCustomApply}
                                className="w-full py-2.5 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                            >
                                Apply Custom Range
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
