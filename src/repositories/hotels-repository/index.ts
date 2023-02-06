import { prisma } from "@/config";

function findMany() {
  return prisma.hotel.findMany();
}

function findOneById(hotelId: number) {
  return prisma.hotel.findUnique({
    where: {
      id: hotelId,
    },
    include: {
      Rooms: true,
    },
  });
}

function findTicket(userId: number) {
  return prisma.ticket.findFirst({
    where: {
      Enrollment: {
        userId,
      },
    },
    include: {
      Enrollment: true,
      TicketType: true,
    },
  });
}

const hotelRepository = {
  findTicket,
  findMany,
  findOneById,
};

export default hotelRepository;
