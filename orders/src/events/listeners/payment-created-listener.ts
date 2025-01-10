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
    const order = await Order.findById(data.orderId);

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status === OrderStatus.Cancelled) {
      // Order was expired before payment
      // Publishing an event saying this payment was failed!

      await new PaymentCreatedFailedPublisher(this.client).publish(data);

      msg.ack();
      return;
    }

    order.set({
      status: OrderStatus.Complete,
    });
    await order.save();

    msg.ack();
  }
}
