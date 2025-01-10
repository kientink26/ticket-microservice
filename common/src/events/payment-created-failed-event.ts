import { Subjects } from "./subjects";

export interface PaymentCreatedFailedEvent {
  subject: Subjects.PaymentCreatedFailed;
  data: {
    id: string;
    orderId: string;
    stripeId: string;
  };
}
