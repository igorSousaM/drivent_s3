import app, { init } from "@/app";
import { createEnrollmentWithAddress, createTicket, createTicketType, createUser } from "../factories";
import faker from "@faker-js/faker";
import supertest from "supertest";
import * as jwt from "jsonwebtoken";
import { cleanDb, generateValidToken } from "../helpers";
import { TicketStatus } from "@prisma/client";
import { createHotel } from "../factories/hotel-factory";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("GET /hotels", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/hotels");
    expect(response.status).toBe(401);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(401);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(401);
  });

  describe("when token is valid", () => {
    it("should respond with 404 when there is no Enrollment for given userId", async () => {
      const token = await generateValidToken();
      const resonse = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
      expect(resonse.status).toBe(404);
    });
    it("should respond with 402 when there is no paid ticket", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(true, false);

      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const resonse = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
      expect(resonse.status).toBe(402);
    });
    it("should respond with 402 when ticketType is remote", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(true, false);

      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const resonse = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
      expect(resonse.status).toBe(402);
    });
    it("should respond with 402 when ticketType not includes a hotel", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, false);

      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const resonse = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
      expect(resonse.status).toBe(402);
    });
    it("should respond with 404 when there is no hotel for given userId", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);

      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const resonse = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
      expect(resonse.status).toBe(404);
    });
    it("should respond with 200 and with existing Hotels data", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);

      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createHotel();
      const resonse = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
      expect(resonse.status).toBe(200);
      expect(resonse.body).toEqual(
        expect.arrayContaining([
          {
            id: expect.any(Number),
            name: expect.any(String),
            image: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          },
        ]),
      );
    });
  });
});

describe("GET /hotels/:id", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/hotels/1");
    expect(response.status).toBe(401);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(401);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    const response = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(401);
  });

  describe("when token is valid", () => {
    it("should respond with 404 when there is no Enrollment for given userId", async () => {
      const token = await generateValidToken();
      const resonse = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`);
      expect(resonse.status).toBe(404);
    });
    it("should respond with 402 when there is no paid ticket", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);

      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      
      const resonse = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`);
      expect(resonse.status).toBe(402);
    });
    it("should respond with 402 when ticketType is remote", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(true, false);

      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const resonse = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`);
      expect(resonse.status).toBe(402);
    });
    it("should respond with 402 when ticketType not includes a hotel", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, false);

      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const resonse = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`);
      expect(resonse.status).toBe(402);
    });
    it("should respond with 404 when there is no hotel for given userId", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);

      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const resonse = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`);
      expect(resonse.status).toBe(404);
    });
    it("should response with 400 when receive an invalid params", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);

      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const resonse = await server.get("/hotels/a").set("Authorization", `Bearer ${token}`);
      expect(resonse.status).toBe(400);
    });
    it("should response with 200 and with hotel data with rooms", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);

      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const hotel = await createHotel();

      const resonse = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);
      expect(resonse.status).toBe(200);
      expect(resonse.body).toEqual({
        id: hotel.id,
        name: hotel.name,
        image: hotel.image,
        createdAt: hotel.createdAt.toISOString(),
        updatedAt: hotel.updatedAt.toISOString(),
        Rooms: [
          {
            id: hotel.Rooms[0].id,
            name: hotel.Rooms[0].name,
            hotelId: hotel.Rooms[0].hotelId,
            capacity: hotel.Rooms[0].capacity,
            createdAt: hotel.Rooms[0].createdAt.toISOString(),
            updatedAt: hotel.Rooms[0].updatedAt.toISOString(),
          },
          {
            id: hotel.Rooms[1].id,
            name: hotel.Rooms[1].name,
            hotelId: hotel.Rooms[1].hotelId,
            capacity: hotel.Rooms[1].capacity,
            createdAt: hotel.Rooms[1].createdAt.toISOString(),
            updatedAt: hotel.Rooms[1].updatedAt.toISOString(),
          },
        ],
      });
    });
  });
});
