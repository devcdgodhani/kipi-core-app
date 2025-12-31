import { Schema, model } from 'mongoose';
import { ILotDocument, IAdjustQuantity } from '../../../interfaces/lot';
import { LOT_TYPE, LOT_STATUS, ADJUST_QUANTITY_TYPE } from '../../../constants';

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
    adjustQuantity: [
      {
        quantity: { type: Number, required: true },
        type: { type: String, enum: Object.values(ADJUST_QUANTITY_TYPE), required: true },
        reason: { type: String, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
    status: { type: String, enum: Object.values(LOT_STATUS), default: LOT_STATUS.ACTIVE },
    notes: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index for list/pagination by date
lotSchema.index({ startDate: 1, endDate: 1 });

lotSchema.pre('save', function (next) {
  if (this.isModified('quantity') || this.isModified('adjustQuantity')) {
    const totalAdjusted = (this.adjustQuantity || []).reduce((acc, curr) => acc + curr.quantity, 0);
    this.remainingQuantity = this.quantity - totalAdjusted;
  }
  next();
});

const LotModel = model<ILotDocument>('Lot', lotSchema);

export default LotModel;
