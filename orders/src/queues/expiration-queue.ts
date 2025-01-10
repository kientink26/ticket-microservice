import Queue from "bull";
import { Order, OrderStatus } from "../models/order";
import { OrderCancelledPublisher } from "../events/publishers/order-cancelled-publisher";
import { natsWrapper } from "../nats-wrapper";

interface Payload {
  orderId: string;
}

const expirationQueue = new Queue<Payload>("order:expiration", {
  redis: {
    host: process.env.REDIS_HOST,
  },
});

expirationQueue.process(async (job) => {
  console.log(`Order ${job.data.orderId} is expired !!!`);

  const order = await Order.findById(job.data.orderId).populate("ticket");

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.status === OrderStatus.Complete) {
    // Order is already complete before expiration
    return;
  }

  // Cancel the order due to expiration
  order.set({
    status: OrderStatus.Cancelled,
  });
  await order.save();
  await new OrderCancelledPublisher(natsWrapper.client).publish({
    id: order.id,
    version: order.version,
    ticket: {
      id: order.ticket.id,
    },
  });
});

export { expirationQueue };
