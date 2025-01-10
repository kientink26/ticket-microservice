import { Publisher, OrderCreatedEvent, Subjects } from "@ticketmk/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
