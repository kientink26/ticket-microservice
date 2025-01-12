import {
  Subjects,
  Listener,
  PaymentCreatedEvent,
  OrderStatus,
} from "@ticketmk/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { Order } from "../../models/order";
import { PaymentCreatedFailedPublisher } from "../publishers/payment-created-failed-publisher";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: PaymentCreatedEvent["data"], msg: Message) {
    const orderUpdateResult = await Order.updateOne(
      { _id: data.orderId, status: OrderStatus.Created },
      { status: OrderStatus.Complete }
    );

    if (orderUpdateResult.matchedCount !== 1) {
      await new PaymentCreatedFailedPublisher(this.client).publish(data);
    }
    msg.ack();
  }
}
