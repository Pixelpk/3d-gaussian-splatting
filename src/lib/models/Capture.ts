import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICapture extends Document {
  title: string;
  status: number;
  thumbnail?: string;
  folderPath?: string;
  serialize?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CaptureSchema = new Schema<ICapture>(
  {
    title: {
      type: String,
      required: true,
    },
    status: {
      type: Number,
      default: 0, // 0 = processing, 1 = completed, 2 = failed
    },
    thumbnail: {
      type: String,
      required: false,
    },
    folderPath: {
      type: String,
      required: false,
    },
    serialize: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
    collection: "captures",
  }
);

// Prevent model recompilation during hot reload in development
const Capture: Model<ICapture> =
  mongoose.models.Capture || mongoose.model<ICapture>("Capture", CaptureSchema);

export default Capture;
