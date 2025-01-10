import { Publisher, Subjects, TicketUpdatedEvent } from "@ticketmk/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}
