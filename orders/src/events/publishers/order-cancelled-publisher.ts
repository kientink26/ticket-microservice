import { Subjects, Publisher, OrderCancelledEvent } from "@ticketmk/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
