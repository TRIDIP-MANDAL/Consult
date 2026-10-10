import request from "supertest";
import { expect } from "chai";
import app from "../../../../index.js";
import prisma from "../../../../model/db.js";

describe("Contact Us Flow", () => {
    let createdContactId = null;

    after(async () => {
        if (createdContactId) {
            await prisma.contactUs.deleteMany({
                where: { email: "contacttest@test.com" }
            });
        }
    });

    it("1. Should submit a contact message successfully", async () => {
        const response = await request(app)
            .post("/contactus/create")
            .send({
                name: "Test User",
                email: "contacttest@test.com",
                message: "This is an integration test message. Hello!"
            });

        expect(response.status).to.equal(201);
        expect(response.body.success).to.equal(true);
        expect(response.body.message).to.include("soon contact you");
        createdContactId = response.body.result?.id;
    });

    it("2. Should fail when name is missing", async () => {
        const response = await request(app)
            .post("/contactus/create")
            .send({
                email: "contacttest@test.com",
                message: "Missing name field"
            });
        expect(response.status).to.not.equal(201);
        expect(response.body.success).to.equal(false);
    });

    it("3. Should fail when email is missing", async () => {
        const response = await request(app)
            .post("/contactus/create")
            .send({
                name: "Test User",
                message: "Missing email field"
            });
        expect(response.status).to.not.equal(201);
        expect(response.body.success).to.equal(false);
    });

    it("4. Should fail when message is missing", async () => {
        const response = await request(app)
            .post("/contactus/create")
            .send({
                name: "Test User",
                email: "contacttest@test.com"
            });
        expect(response.status).to.not.equal(201);
        expect(response.body.success).to.equal(false);
    });

    it("5. Should fail when request body is completely empty", async () => {
        const response = await request(app)
            .post("/contactus/create")
            .send({});
        expect(response.status).to.not.equal(201);
        expect(response.body.success).to.equal(false);
    });
});
