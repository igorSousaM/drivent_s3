import { notFoundError, paymentRequiredError } from "@/errors";
import hotelRepository from "@/repositories/hotels-repository";

async function getHotelsAndVerifyUserId(userId: number) {
  verifyUserTicket(userId);
  const hotelsList = await hotelRepository.findMany();
  if (!hotelsList) throw notFoundError();
  return hotelsList;
}
async function getHotelByIdAndVerifyUserId(hotelId: number, userId: number) {
  verifyUserTicket(userId);
  const hotel = await hotelRepository.findOneById(hotelId);
  if (!hotel) throw notFoundError();
  return hotel;
}

async function verifyUserTicket(userId: number) {
  const ticketFound = await hotelRepository.findTicket(userId);
  if (!ticketFound) throw notFoundError();

  const isPaid = ticketFound.status === "PAID";
  const isRemote = ticketFound.TicketType.isRemote;
  const includesHotel = ticketFound.TicketType.includesHotel;

  if (!isPaid || isRemote || !includesHotel) throw paymentRequiredError();
}

const hotelServices = {
  getHotelsAndVerifyUserId,
  getHotelByIdAndVerifyUserId,
};

export default hotelServices;
