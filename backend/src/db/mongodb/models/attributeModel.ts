import { Schema, model } from 'mongoose';
import { IAttribute } from '../../../interfaces';
import { ATTRIBUTE_TYPE } from '../../../constants';
import { softDeletePlugin } from '../plugins/softDeletePlugin';

const attributeSchema = new Schema<IAttribute>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    type: {
      type: String,
      enum: Object.values(ATTRIBUTE_TYPE),
      required: true,
    },
    options: {
      type: [String],
      default: undefined,
    },
    isVariant: {
      type: Boolean,
      default: false,
    },
    isSpecification: {
      type: Boolean,
      default: false,
    },
    group: {
      type: String,
      trim: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    unit: {
      type: String,
      trim: true,
    },
    validationRules: {
      min: Number,
      max: Number,
      regex: String,
    },
    isRequired: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

attributeSchema.plugin(softDeletePlugin);

// Indexes
// attributeSchema.index({ code: 1 });
attributeSchema.index({ isVariant: 1, isActive: 1 });

const AttributeModel = model<IAttribute>('Attribute', attributeSchema);

export default AttributeModel;
