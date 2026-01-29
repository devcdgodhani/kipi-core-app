import { Schema, model } from 'mongoose';
import { IThemeDocument } from '../../../interfaces/theme';
import { THEME_APP_NAME, THEME_STATUS } from '../../../constants/theme';

const themeSchema = new Schema<IThemeDocument>(
  {
    appName: {
      type: String,
      enum: Object.values(THEME_APP_NAME),
      required: true,
      unique: true // Ensure one theme per app
    },
    name: {
      type: String,
      default: 'Default Theme'
    },
    colors: {
      primary: { type: String, required: true },
      secondary: { type: String, required: true },
      background: { type: String, required: true },
      accent: { type: String, required: true },
    },
    status: { 
      type: String, 
      enum: Object.values(THEME_STATUS), 
      default: THEME_STATUS.ACTIVE 
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes
themeSchema.index({ appName: 1 });

export const ThemeModel = model<IThemeDocument>('Theme', themeSchema);
