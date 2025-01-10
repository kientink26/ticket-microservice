import {
  Subjects,
  Publisher,
  PaymentCreatedFailedEvent,
} from "@ticketmk/common";

export class PaymentCreatedFailedPublisher extends Publisher<PaymentCreatedFailedEvent> {
  subject: Subjects.PaymentCreatedFailed = Subjects.PaymentCreatedFailed;
}
