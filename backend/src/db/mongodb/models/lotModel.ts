import { Schema, model } from 'mongoose';
import { ILotDocument } from '../../../interfaces/lot';
import { LOT_TYPE, LOT_STATUS } from '../../../constants';

const lotSchema = new Schema<ILotDocument>(
  {
    lotNumber: { type: String, required: true, unique: true },
    type: { type: String, enum: Object.values(LOT_TYPE), default: LOT_TYPE.SELF_MANUFACTURE },
    supplierId: { type: Schema.Types.ObjectId, ref: 'User' },
    basePrice: { type: Number, required: true, default: 0 },
    quantity: { type: Number, required: true, default: 0 },
    remainingQuantity: { type: Number, required: true, default: 0 },
    startDate: { type: Date },
    endDate: { type: Date },
    status: { type: String, enum: Object.values(LOT_STATUS), default: LOT_STATUS.ACTIVE },
    notes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index for list/pagination by date
lotSchema.index({ startDate: 1, endDate: 1 });

const LotModel = model<ILotDocument>('Lot', lotSchema);

export default LotModel;
