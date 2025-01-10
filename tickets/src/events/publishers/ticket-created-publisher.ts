import { Publisher, Subjects, TicketCreatedEvent } from "@ticketmk/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
