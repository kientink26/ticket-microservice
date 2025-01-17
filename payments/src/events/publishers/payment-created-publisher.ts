import { Subjects, Publisher, PaymentCreatedEvent } from "@ticketmk/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
