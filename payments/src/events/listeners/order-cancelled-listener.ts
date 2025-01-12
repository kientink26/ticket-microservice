import {
  OrderCancelledEvent,
  Subjects,
  Listener,
  OrderStatus,
} from "@ticketmk/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { Order } from "../../models/order";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
    await Order.updateOne({ _id: data.id }, { status: OrderStatus.Cancelled });

    msg.ack();
  }
}
