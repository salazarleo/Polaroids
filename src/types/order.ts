export type OrderStatus = "pending" | "paid" | "expired" | "failed";

export interface CheckoutItem {
  photoUrl: string;
  caption: string;
  templateId: string;
  fontStyleId: string | null;
  fontWeightId: string;
  polaroidSizeId: string;
  size: string;
  align: string;
  imagePosX: number;
  imagePosY: number;
}

export interface CheckoutResult {
  orderId: string;
  totalCentavos: number;
}
