import Queue from "bull";
import { Order, OrderStatus } from "../models/order";
import { OrderCancelledPublisher } from "../events/publishers/order-cancelled-publisher";
import { natsWrapper } from "../nats-wrapper";
import { Ticket } from "../models/ticket";

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

  const orderUpdateResult = await Order.updateOne(
    { _id: job.data.orderId, status: OrderStatus.Created },
    { status: OrderStatus.Cancelled }
  );

  if (orderUpdateResult.matchedCount === 1) {
    const cancelledOrder = (await Order.findById(job.data.orderId).populate(
      "ticket"
    ))!;

    await Ticket.updateOne(
      { _id: cancelledOrder.ticket.id },
      { reserved: false }
    );

    await new OrderCancelledPublisher(natsWrapper.client).publish({
      id: cancelledOrder.id,
      version: cancelledOrder.version,
      ticket: {
        id: cancelledOrder.ticket.id,
      },
    });
  }
});

export { expirationQueue };
