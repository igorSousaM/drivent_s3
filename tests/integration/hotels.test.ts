import app from "@/app";
import { createEnrollmentWithAddress, createTicket, createTicketType, createUser } from "../factories";
import faker from "@faker-js/faker";
import httpStatus from "http-status";
import supertest from "supertest";
import * as jwt from "jsonwebtoken";
import { generateValidToken } from "../helpers";
import { TicketStatus } from "@prisma/client";

const server = supertest(app);

describe("GET /hotels", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/hotels");
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with 404 when there is no Enrollment for given userId", async () => {
      const token = await generateValidToken();
      const resonse = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
      expect(resonse.status).toBe(httpStatus.NOT_FOUND);
    });
    it("should respond with 402 when there is no paid ticket", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(true, false);
      
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      
      const resonse = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
      expect(resonse.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });
    it("should respond with 402 when ticketType is remote", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(true, false);
      
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      
      const resonse = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
      expect(resonse.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });
    it("should respond with 402 when ticketType not includes a hotel", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, false);
      
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      
      const resonse = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
      expect(resonse.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });
    it("should respond with 404 when there is no hotel for given userId", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      
      const resonse = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
      expect(resonse.status).toBe(httpStatus.NOT_FOUND);
    });
    it("should respond with 200 and with existing Hotels data", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      //await createHotel();
      const resonse = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
      expect(resonse.status).toBe(httpStatus.OK);
      expect(resonse.body).toEqual(expect.arrayContaining([{
        id: expect.any(Number),
        name: expect.any(String),
        image: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      }]));
    });
  });
});
