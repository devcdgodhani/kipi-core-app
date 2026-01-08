import React from 'react';
import type { PaymentGatewayOption } from '../../types/payment';
import { CreditCard, Wallet, Smartphone } from 'lucide-react';

interface GatewaySelectorProps {
    gateways: PaymentGatewayOption[];
    selectedGateway: string;
    onSelect: (gatewayName: string) => void;
    disabled?: boolean;
}

const GatewayIcons: Record<string, React.ReactNode> = {
    RAZORPAY: <CreditCard className="w-6 h-6 text-blue-600" />,
    PHONEPE: <Smartphone className="w-6 h-6 text-purple-600" />,
    PAYTM: <Wallet className="w-6 h-6 text-cyan-600" />
};

export const GatewaySelector: React.FC<GatewaySelectorProps> = ({
    gateways,
    selectedGateway,
    onSelect,
    disabled
}) => {
    return (
        <div className="space-y-3">
            {gateways.map((gateway) => (
                <div
                    key={gateway.name}
                    onClick={() => !disabled && onSelect(gateway.name)}
                    className={`
            relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all
            ${selectedGateway === gateway.name
                            ? 'border-primary bg-primary/5 shadow-md'
                            : 'border-gray-100 hover:border-gray-200 bg-white'
                        }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
                >
                    <div className="flex-shrink-0 mr-4">
                        {GatewayIcons[gateway.name] || <CreditCard className="w-6 h-6 text-gray-500" />}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-gray-900">{gateway.displayName}</h3>
                        <p className="text-xs text-gray-500">Secure payment via {gateway.displayName}</p>
                    </div>
                    <div className="ml-4">
                        <div className={`
              w-5 h-5 rounded-full border-2 flex items-center justify-center
              ${selectedGateway === gateway.name ? 'border-primary' : 'border-gray-300'}
            `}>
                            {selectedGateway === gateway.name && (
                                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                            )}
                        </div>
                    </div>
                </div>
            ))}

            {gateways.length === 0 && (
                <div className="text-center p-6 bg-gray-50 rounded-xl text-gray-500 text-sm">
                    No payment gateways available at the moment.
                </div>
            )}
        </div>
    );
};
