import { courierService } from '../../../services/concrete/courierService';

export const seedCouriers = async () => {
    const couriers = [
        {
            name: 'Shiprocket',
            code: 'SHIPROCKET',
            provider: 'SHIPROCKET',
            isActive: true,
            isPrimary: true,
            serviceTypes: [
                { type: 'SURFACE', name: 'Surface', estimatedDays: 5, isActive: true },
                { type: 'EXPRESS', name: 'Express', estimatedDays: 2, isActive: true }
            ],
            slaMin: 2,
            slaMax: 7
        },
        {
            name: 'Delhivery',
            code: 'DELHIVERY',
            provider: 'DELHIVERY',
            isActive: false,
            isPrimary: false,
            serviceTypes: [
                { type: 'SURFACE', name: 'Surface', estimatedDays: 6, isActive: true }
            ],
            slaMin: 3,
            slaMax: 8
        }
    ];

    for (const courier of couriers) {
        const exists = await courierService.findOne({ code: courier.code });
        if (!exists) {
            await courierService.create(courier as any);
            console.log(`Seeded courier: ${courier.name}`);
        }
    }
};
