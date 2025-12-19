import { Document, Types } from "mongoose";

export interface INotification extends Document {
  userId?: Types.ObjectId | null;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  category: "user" | "url" | "qr" | "system" | "settings" | "security";
  read: boolean;
  forAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}