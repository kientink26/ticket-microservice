import {
  Subjects,
  Listener,
  PaymentCreatedFailedEvent,
} from "@ticketmk/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { stripe } from "../../stripe";

export class PaymentCreatedFailedListener extends Listener<PaymentCreatedFailedEvent> {
  subject: Subjects.PaymentCreatedFailed = Subjects.PaymentCreatedFailed;
  queueGroupName = queueGroupName;

  async onMessage(data: PaymentCreatedFailedEvent["data"], msg: Message) {
    // Create a refund
    const charge = await stripe.refunds.create({
      charge: data.stripeId,
    });
    msg.ack();
  }
}
