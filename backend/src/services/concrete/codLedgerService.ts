import { CODLedgerModel } from '../../db/mongodb';
import { Types } from 'mongoose';

export class CodLedgerService {
  /**
   * Creates a new COD ledger entry for a shipment.
   */
  async createEntry(params: {
    orderId: string;
    shipmentId: string;
    awb: string;
    codAmount: number;
    courierId: string;
    courierName: string;
  }): Promise<void> {
    await CODLedgerModel.create({
      orderId: new Types.ObjectId(params.orderId),
      shipmentId: new Types.ObjectId(params.shipmentId),
      awb: params.awb,
      codAmount: params.codAmount,
      status: 'PENDING',
      courierId: new Types.ObjectId(params.courierId),
      courierName: params.courierName,
      isReconciled: false
    });
  }

  /**
   * Updates the ledger entry when a shipment status changes.
   */
  async updateStatus(awb: string, status: string, additionalData: any = {}): Promise<void> {
    const update: any = { status };
    
    if (status === 'DELIVERED') {
      update.collectionDate = new Date();
    } else if (status === 'RTO') {
      update.status = 'RTO';
    }

    await CODLedgerModel.updateOne({ awb }, { $set: { ...update, ...additionalData } });
  }

  /**
   * Records a remittance/settlement from the courier.
   */
  async recordSettlement(awb: string, settlementData: {
    settlementAmount: number;
    settlementDate: Date;
    utrNumber?: string;
    charges?: number;
  }): Promise<void> {
    const { settlementAmount, settlementDate, utrNumber, charges } = settlementData;
    
    const ledger = await CODLedgerModel.findOne({ awb });
    if (!ledger) return;

    const difference = ledger.codAmount - settlementAmount - (charges || 0);
    
    await CODLedgerModel.updateOne(
      { awb },
      {
        $set: {
          status: 'SETTLED',
          settlementAmount,
          settlementDate,
          utrNumber,
          settlementCharges: charges,
          netSettlement: settlementAmount,
          isReconciled: difference === 0,
          reconciledDate: new Date(),
          discrepancy: difference !== 0 ? {
            expectedAmount: ledger.codAmount,
            receivedAmount: settlementAmount,
            difference: difference,
            reason: 'Settlement mismatch'
          } : undefined
        }
      }
    );
  }
}

export const codLedgerService = new CodLedgerService();
