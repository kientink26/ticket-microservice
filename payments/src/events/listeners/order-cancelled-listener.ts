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
    const order = await Order.findById(data.id);

    if (!order) {
      throw new Error("Order not found");
    }

    if (data.version !== order.version + 1) {
      // Event out of order. Don't process now
      return;
    }

    order.set({ status: OrderStatus.Cancelled });
    await order.save();

    msg.ack();
  }
}
