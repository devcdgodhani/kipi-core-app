
export interface CalculateEtaRequest {
    destinationPincode: string;
    courierId?: string;
    pickupPincode?: string;
    weight?: number;
}

export interface EtaResponse {
    courierId: string;
    courierName: string;
    estimatedDeliveryDate: string;
    deliveryDays: number;
    shippingCost: number;
    codAvailable: boolean;
    pickupDate?: string;
    rtoCharges?: number;
}
