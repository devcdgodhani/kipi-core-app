import React, { useState, useEffect, useCallback } from 'react';
import {
    Cpu,
    Play,
    History as HistoryIcon,
    RefreshCcw,
    Activity,
    Clock,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import http from '../../services/http';
import { Table, type Column } from '../../components/common/Table';
import { Modal } from '../../components/common/Modal';
import CustomButton from '../../components/common/Button';

interface ICronJob {
    _id: string;
    name: string;
    identifier: string;
    expression: string;
    status: 'ACTIVE' | 'INACTIVE' | 'PAUSED';
    level: 'SYSTEM' | 'USER';
    lastRun?: string;
    nextRun?: string;
    lastResult?: 'SUCCESS' | 'FAILURE';
    lastError?: string;
}

interface ICronJobHistory {
    _id: string;
    runAt: string;
    durationMs: number;
    status: 'SUCCESS' | 'FAILURE';
    error?: string;
}

export const CronJobHub: React.FC = () => {
    const [jobs, setJobs] = useState<ICronJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState<ICronJobHistory[]>([]);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState<ICronJob | null>(null);

    const fetchJobs = useCallback(async () => {
        try {
            setLoading(true);
            const response = await http.post<any>('/cron-job/getAll');
            setJobs(response.data || []);
        } catch (err) {
            console.error('Failed to fetch cron jobs');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    const handleRunJob = async (identifier: string) => {
        try {
            await http.post('/cron-job/run', { identifier });
            alert(`Job ${identifier} execution triggered`);
            fetchJobs();
        } catch (err) {
            alert('Failed to trigger job');
        }
    };

    const fetchHistory = async (job: ICronJob) => {
        try {
            setSelectedJob(job);
            const response = await http.get<any>(`/cron-job/history/${job._id}`);
            setHistory(response.data || []);
            setIsHistoryModalOpen(true);
        } catch (err) {
            alert('Failed to fetch history');
        }
    };

    const columns: Column<ICronJob>[] = [
        {
            header: 'Job Information',
            key: 'info',
            render: (job) => (
                <div className="flex items-center gap-4 py-2">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm">
                        <Cpu size={24} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900 leading-tight">{job.name}</span>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-black uppercase tracking-tighter">
                                {job.identifier}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-tighter border ${job.level === 'SYSTEM' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                                }`}>
                                {job.level}
                            </span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            header: 'Schedule',
            key: 'schedule',
            render: (job) => (
                <div className="flex items-center gap-2 font-mono text-xs bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 w-fit text-slate-600">
                    <Clock size={12} />
                    {job.expression}
                </div>
            )
        },
        {
            header: 'Last Execution',
            key: 'lastRun',
            render: (job) => (
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-gray-500">
                        {job.lastRun ? new Date(job.lastRun).toLocaleString() : 'Never'}
                    </span>
                    {job.lastResult && (
                        <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${job.lastResult === 'SUCCESS' ? 'text-green-500' : 'text-rose-500'
                            }`}>
                            {job.lastResult === 'SUCCESS' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                            {job.lastResult}
                        </div>
                    )}
                </div>
            )
        },
        {
            header: 'Actions',
            key: 'actions',
            align: 'right',
            render: (job) => (
                <div className="flex items-center justify-end gap-3">
                    <button
                        onClick={() => handleRunJob(job.identifier)}
                        className="p-2.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all border border-transparent hover:border-green-100"
                        title="Run Now"
                    >
                        <Play size={20} />
                    </button>
                    <button
                        onClick={() => fetchHistory(job)}
                        className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-transparent hover:border-indigo-100"
                        title="View History"
                    >
                        <HistoryIcon size={20} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Hero Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-indigo-500/10 transition-colors duration-1000" />
                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
                        <Activity size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-primary tracking-tight uppercase font-mono">Cron Job Hub</h1>
                        <p className="text-sm text-gray-500 font-medium">Monitor and manage platform background tasks</p>
                    </div>
                </div>
                <CustomButton onClick={fetchJobs} variant="secondary" className="rounded-2xl h-14 px-8 relative z-10">
                    <RefreshCcw size={20} className="mr-2" /> Sync Records
                </CustomButton>
            </div>

            <Table
                data={jobs}
                columns={columns}
                isLoading={loading}
                emptyMessage="No background tasks registered"
                keyExtractor={(j) => j._id}
            />

            {/* History Modal */}
            <Modal
                isOpen={isHistoryModalOpen}
                onClose={() => setIsHistoryModalOpen(false)}
                title={`Execution History: ${selectedJob?.name}`}
                maxWidth="max-w-3xl"
            >
                <div className="space-y-4">
                    <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                        {history.length === 0 ? (
                            <div className="py-12 text-center text-gray-500 font-medium">No history records found for this task</div>
                        ) : (
                            <table className="w-full text-left">
                                <thead className="sticky top-0 bg-white border-b border-gray-100">
                                    <tr>
                                        <th className="pb-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Run Time</th>
                                        <th className="pb-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Duration</th>
                                        <th className="pb-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {history.map((h) => (
                                        <tr key={h._id} className="group hover:bg-gray-50/50 transition-colors">
                                            <td className="py-4 text-xs font-bold text-gray-700">
                                                {new Date(h.runAt).toLocaleString()}
                                            </td>
                                            <td className="py-4 text-xs font-semibold text-gray-500 text-center">
                                                {h.durationMs}ms
                                            </td>
                                            <td className="py-4 text-right">
                                                <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${h.status === 'SUCCESS' ? 'text-green-500' : 'text-rose-500'
                                                    }`}>
                                                    {h.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                    <div className="flex justify-end pt-4 border-t border-gray-100">
                        <CustomButton variant="secondary" onClick={() => setIsHistoryModalOpen(false)}>
                            Close Explorer
                        </CustomButton>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
