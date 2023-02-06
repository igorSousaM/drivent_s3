import { AuthenticatedRequest } from "@/middlewares";
import hotelServices from "@/services/hotels-service";
import { Response } from "express";

export async function getHotels(req: AuthenticatedRequest, res: Response) {
  const userId = Number(req.userId);

  try {
    const hotelsList = hotelServices.getHotelsAndVerifyUserId(userId);
    res.status(200).send(hotelsList);
  } catch (err) {
    if (err.name === "NotFoundError") {
      res.sendStatus(404);
    } else if (err.name === "PaymentRequiredError") {
      res.sendStatus(402);
    } else {
      res.sendStatus(400);
    }
  }
}

export async function getHotelById(req: AuthenticatedRequest, res: Response) {
  const userId = Number(req.userId);
  const hotelId = Number(req.params.id);
  try {
    const hotel = hotelServices.getHotelByIdAndVerifyUserId(hotelId, userId);
    res.status(200).send(hotel);
  } catch (err) {
    if (err.name === "NotFoundError") {
      res.sendStatus(404);
    } else if (err.name === "PaymentRequiredError") {
      res.sendStatus(402);
    } else {
      res.sendStatus(400);
    }
  }
}
