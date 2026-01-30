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
    RAZORPAY: <CreditCard className="w-6 h-6 text-blue-500" />,
    PHONEPE: <Smartphone className="w-6 h-6 text-purple-500" />,
    PAYTM: <Wallet className="w-6 h-6 text-cyan-500" />
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
                        : 'border-primary/10 hover:border-primary/20 bg-background'
                        }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
                >
                    <div className="flex-shrink-0 mr-4">
                        {GatewayIcons[gateway.name] || <CreditCard className="w-6 h-6 text-secondary" />}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-primary">{gateway.displayName}</h3>
                        <p className="text-xs text-secondary">Secure payment via {gateway.displayName}</p>
                    </div>
                    <div className="ml-4">
                        <div className={`
              w-5 h-5 rounded-full border-2 flex items-center justify-center
              ${selectedGateway === gateway.name ? 'border-primary' : 'border-primary/20'}
            `}>
                            {selectedGateway === gateway.name && (
                                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                            )}
                        </div>
                    </div>
                </div>
            ))}

            {gateways.length === 0 && (
                <div className="text-center p-6 bg-primary/5 rounded-xl text-secondary text-sm">
                    No payment gateways available at the moment.
                </div>
            )}
        </div>
    );
};
