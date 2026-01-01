import { Schema, model } from 'mongoose';
import { IAttributeDocument } from '../../../interfaces/attribute';
import { ATTRIBUTE_STATUS, ATTRIBUTE_VALUE_TYPE, ATTRIBUTE_INPUT_TYPE } from '../../../constants';

const attributeOptionSchema = new Schema(
  {
    label: { type: String, required: true },
    value: { type: String, required: true },
    color: { type: String },
  },
  { _id: false }
);

const attributeValidationSchema = new Schema(
  {
    required: { type: Boolean, default: false },
    min: { type: Number },
    max: { type: Number },
    pattern: { type: String },
    customMessage: { type: String },
  },
  { _id: false }
);

const attributeSchema = new Schema<IAttributeDocument>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    valueType: { 
      type: String, 
      enum: Object.values(ATTRIBUTE_VALUE_TYPE), 
      required: true 
    },
    inputType: { 
      type: String, 
      enum: Object.values(ATTRIBUTE_INPUT_TYPE), 
      required: true 
    },
    options: [attributeOptionSchema],
    defaultValue: { type: Schema.Types.Mixed },
    validation: attributeValidationSchema,
    unit: { type: String },
    isFilterable: { type: Boolean, default: false },
    isRequired: { type: Boolean, default: false },
    isVariant: { type: Boolean, default: false },
    categoryIds: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    order: { type: Number, default: 0 },
    status: { 
      type: String, 
      enum: Object.values(ATTRIBUTE_STATUS), 
      default: ATTRIBUTE_STATUS.ACTIVE 
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for efficient querying
attributeSchema.index({ categoryIds: 1 });
attributeSchema.index({ status: 1 });
attributeSchema.index({ isVariant: 1 });
attributeSchema.index({ isFilterable: 1 });

const AttributeModel = model<IAttributeDocument>('Attribute', attributeSchema);

export default AttributeModel;
