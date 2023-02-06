import { AuthenticatedRequest } from "@/middlewares";
import hotelServices from "@/services/hotels-service";
import { Response } from "express";

export async function getHotels(req: AuthenticatedRequest, res: Response) {
  const userId = Number(req.userId);

  try {
    const hotelsList = await hotelServices.getHotelsAndVerifyUserId(userId);
    return res.status(200).send(hotelsList);
  } catch (err) {
    if (err.name === "NotFoundError") {
      return res.sendStatus(404);
    } else if (err.name === "PaymentRequiredError") {
      return res.sendStatus(402);
    } else {
      return res.sendStatus(400);
    }
  }
}

export async function getHotelById(req: AuthenticatedRequest, res: Response) {
  const userId = Number(req.userId);
  const hotelId = Number(req.params.id);
  try {
    const hotel = await hotelServices.getHotelByIdAndVerifyUserId(hotelId, userId);
    return res.status(200).send(hotel);
  } catch (err) {
    if (err.name === "NotFoundError") {
      return res.sendStatus(404);
    } else if (err.name === "PaymentRequiredError") {
      return res.sendStatus(402);
    } else {
      return res.sendStatus(400);
    }
  }
}
