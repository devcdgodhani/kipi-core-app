import React from 'react';
import { format } from 'date-fns';
import { Check, Clock, MapPin } from 'lucide-react';

interface TimelineEvent {
    status: string;
    timestamp: string;
    location?: string;
    message?: string;
}

interface TrackingTimelineProps {
    events: TimelineEvent[];
}

export const TrackingTimeline: React.FC<TrackingTimelineProps> = ({ events }) => {
    if (!events || events.length === 0) return <div className="text-gray-500 text-sm">No tracking events available.</div>;

    return (
        <div className="flow-root">
            <ul role="list" className="-mb-8">
                {events.map((event, eventIdx) => (
                    <li key={eventIdx}>
                        <div className="relative pb-8">
                            {eventIdx !== events.length - 1 ? (
                                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                            ) : null}
                            <div className="relative flex space-x-3">
                                <div>
                                    <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${eventIdx === 0 ? 'bg-green-500' : 'bg-gray-400'
                                        }`}>
                                        {eventIdx === 0 ? (
                                            <Check className="h-5 w-5 text-white" aria-hidden="true" />
                                        ) : (
                                            <Clock className="h-5 w-5 text-white" aria-hidden="true" />
                                        )}
                                    </span>
                                </div>
                                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {event.status} <span className="text-gray-500 font-normal"> - {event.message}</span>
                                        </p>
                                        {event.location && (
                                            <p className="mt-1 text-sm text-gray-500 flex items-center gap-1">
                                                <MapPin size={12} /> {event.location}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                        <time dateTime={event.timestamp}>{format(new Date(event.timestamp), 'PP p')}</time>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};
