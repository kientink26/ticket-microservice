import mongoose from "mongoose";
import express, { Request, Response } from "express";
import {
  requireAuth,
  validateRequest,
  NotFoundError,
  OrderStatus,
  BadRequestError,
} from "@ticketmk/common";
import { body } from "express-validator";
import { Ticket } from "../models/ticket";
import { Order } from "../models/order";
import { OrderCreatedPublisher } from "../events/publishers/order-created-publisher";
import { natsWrapper } from "../nats-wrapper";
import { expirationQueue } from "../queues/expiration-queue";

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 3 * 60;

router.post(
  "/api/orders",
  requireAuth,
  [
    body("ticketId")
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage("TicketId must be provided"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;

    const reservedTicket = await Ticket.findOneAndUpdate(
      {
        _id: ticketId,
        reserved: false,
      },
      {
        reserved: true,
      },
      { new: true }
    );

    if (!reservedTicket) {
      throw new BadRequestError("Ticket is not found or already reserved");
    }

    // Calculate an expiration date for this order
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    // Build the order and save it to the database
    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket: reservedTicket,
    });
    await order.save();

    // Add order id to the expriation queue to time out order
    await expirationQueue.add(
      {
        orderId: order.id,
      },
      {
        delay: EXPIRATION_WINDOW_SECONDS * 1000,
      }
    );

    // Publish an event saying that an order was created
    new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      ticket: {
        id: reservedTicket.id,
        price: reservedTicket.price,
      },
    });

    res.status(201).send(order);
  }
);

export { router as newOrderRouter };
