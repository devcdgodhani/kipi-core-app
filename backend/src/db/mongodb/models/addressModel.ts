import { Schema, model } from 'mongoose';
import { IAddressDocument } from '../../../interfaces/address';
import { ADDRESS_TYPE, ADDRESS_STATUS } from '../../../constants/address';

const locationSchema = new Schema(
  {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }, // [longitude, latitude]
  },
  { _id: false }
);

export const AddressSchema = new Schema<IAddressDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'users', required: true, index: true },
    name: { type: String, required: true, maxLength: 100 },
    mobile: { type: String, required: true, maxLength: 15 },
    alternateMobile: { type: String, maxLength: 15 },
    street: { type: String, required: true, maxLength: 200 },
    landmark: { type: String, maxLength: 100 },
    city: { type: String, required: true, maxLength: 100 },
    state: { type: String, required: true, maxLength: 100 },
    pincode: { type: String, required: true, maxLength: 10 },
    country: { type: String, required: true, maxLength: 100, default: 'India' },
    type: { 
      type: String, 
      enum: Object.values(ADDRESS_TYPE), 
      default: ADDRESS_TYPE.HOME 
    },
    location: locationSchema,
    isDefault: { type: Boolean, default: false },
    status: { 
      type: String, 
      enum: Object.values(ADDRESS_STATUS), 
      default: ADDRESS_STATUS.ACTIVE 
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index for user addresses
AddressSchema.index({ userId: 1, status: 1 });
// Geospatial index for location-based queries
AddressSchema.index({ location: '2dsphere' });

// Pre-save hook to ensure only one default address per user
AddressSchema.pre('save', async function (next) {
  if (this.isDefault && this.isModified('isDefault')) {
    await model('Address').updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

export const AddressModel = model<IAddressDocument>('Address', AddressSchema);
