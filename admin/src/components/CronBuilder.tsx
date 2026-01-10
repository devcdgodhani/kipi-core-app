import React, { useEffect, useState } from 'react';

interface CronBuilderProps {
    scheduleMinute?: string;
    scheduleHour?: string;
    scheduleDayOfMonth?: string;
    scheduleMonth?: string;
    scheduleDayOfWeek?: string;
    onChange: (data: {
        scheduleMinute: string;
        scheduleHour: string;
        scheduleDayOfMonth: string;
        scheduleMonth: string;
        scheduleDayOfWeek: string;
        expression: string;
    }) => void;
}

export const CronBuilder: React.FC<CronBuilderProps> = ({
    scheduleMinute = '*',
    scheduleHour = '*',
    scheduleDayOfMonth = '*',
    scheduleMonth = '*',
    scheduleDayOfWeek = '*',
    onChange
}) => {
    const [minute, setMinute] = useState(scheduleMinute);
    const [hour, setHour] = useState(scheduleHour);
    const [dom, setDom] = useState(scheduleDayOfMonth);
    const [month, setMonth] = useState(scheduleMonth);
    const [dow, setDow] = useState(scheduleDayOfWeek);

    useEffect(() => {
        setMinute(scheduleMinute);
        setHour(scheduleHour);
        setDom(scheduleDayOfMonth);
        setMonth(scheduleMonth);
        setDow(scheduleDayOfWeek);
    }, [scheduleMinute, scheduleHour, scheduleDayOfMonth, scheduleMonth, scheduleDayOfWeek]);

    const handleChange = (field: string, value: string) => {
        let newMinute = minute;
        let newHour = hour;
        let newDom = dom;
        let newMonth = month;
        let newDow = dow;

        if (field === 'minute') { setMinute(value); newMinute = value; }
        if (field === 'hour') { setHour(value); newHour = value; }
        if (field === 'dom') { setDom(value); newDom = value; }
        if (field === 'month') { setMonth(value); newMonth = value; }
        if (field === 'dow') { setDow(value); newDow = value; }

        const expression = `${newMinute} ${newHour} ${newDom} ${newMonth} ${newDow}`;
        onChange({
            scheduleMinute: newMinute,
            scheduleHour: newHour,
            scheduleDayOfMonth: newDom,
            scheduleMonth: newMonth,
            scheduleDayOfWeek: newDow,
            expression
        });
    };

    return (
        <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Construct Schedule</h3>
            <div className="grid grid-cols-5 gap-2">
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Minute</label>
                    <input
                        type="text"
                        value={minute}
                        onChange={(e) => handleChange('minute', e.target.value)}
                        className="w-full h-10 px-2 rounded-lg border border-gray-200 text-center font-mono text-sm"
                        placeholder="*"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Hour</label>
                    <input
                        type="text"
                        value={hour}
                        onChange={(e) => handleChange('hour', e.target.value)}
                        className="w-full h-10 px-2 rounded-lg border border-gray-200 text-center font-mono text-sm"
                        placeholder="*"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Day (Month)</label>
                    <input
                        type="text"
                        value={dom}
                        onChange={(e) => handleChange('dom', e.target.value)}
                        className="w-full h-10 px-2 rounded-lg border border-gray-200 text-center font-mono text-sm"
                        placeholder="*"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Month</label>
                    <input
                        type="text"
                        value={month}
                        onChange={(e) => handleChange('month', e.target.value)}
                        className="w-full h-10 px-2 rounded-lg border border-gray-200 text-center font-mono text-sm"
                        placeholder="*"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Day (Week)</label>
                    <input
                        type="text"
                        value={dow}
                        onChange={(e) => handleChange('dow', e.target.value)}
                        className="w-full h-10 px-2 rounded-lg border border-gray-200 text-center font-mono text-sm"
                        placeholder="*"
                    />
                </div>
            </div>

            <div className="text-xs text-indigo-600 font-mono bg-indigo-50 px-3 py-2 rounded-lg border border-indigo-100 mt-2">
                Result: <strong>{`${minute} ${hour} ${dom} ${month} ${dow}`}</strong>
            </div>
        </div>
    );
};
