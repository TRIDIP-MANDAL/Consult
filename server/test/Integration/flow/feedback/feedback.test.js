import request from "supertest";
import { expect } from "chai";
import app from "../../../../index.js";
import redis from "../../../../lib/redis.js";
import prisma from "../../../../model/db.js";
import userData from "../../data/test_user.json" with { type: "json" };

const TEST_EMAIL = "integration_test_user@test.com";
const TEST_PHONE = "+919999999901";
const TEST_PASSWORD = "TestPass@1234";

async function seedUser() {
    await redis.set(`otp:${TEST_EMAIL}:verified`, true);
    await redis.set(`otp:${TEST_PHONE}:verified`, true);
    await request(app).post("/auth/signup").send(userData);
}

async function cleanupUser() {
    await prisma.users.deleteMany({
        where: {
            OR: [
                { email: TEST_EMAIL },
                { phone: TEST_PHONE }
            ]
        }
    });
}

describe("Feedback Flow", () => {
    const agent = request.agent(app);
    let feedbackId = null;

    before(async () => {
        await seedUser();
        const loginRes = await agent.post("/auth/login").send({
            email: TEST_EMAIL,
            password: TEST_PASSWORD
        });
        expect(loginRes.status).to.equal(200);
    });

    after(async () => {
        const user = await prisma.users.findUnique({ where: { email: TEST_EMAIL } });
        if (user) {
            await prisma.feedback.deleteMany({ where: { user_id: user.id } });
        }
        await cleanupUser();
    });

    it("1. Should fetch all feedbacks without login (public route)", async () => {
        const response = await request(app).get("/feedback/fetchall?page=1&limit=2&order=asc");
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property("feedbacks");
        expect(response.body.feedbacks).to.be.an("array");
    });

    it("2. Should support pagination query params on fetchall", async () => {
        const response = await request(app).get("/feedback/fetchall?page=1&limit=2&order=asc");
        expect(response.status).to.equal(200);
        expect(response.body.feedbacks).to.be.an("array");
    });

    it("3. Should fail to create feedback when NOT logged in", async () => {
        const response = await request(app)
            .post("/feedback/create")
            .send({ content: "Great service!", rating: 5 });
        expect(response.status).to.equal(401);
        expect(response.body.success).to.equal(false);
    });

    it("4. Should create feedback successfully when logged in", async () => {
        const response = await agent
            .post("/feedback/create")
            .send({ content: "Great integration test service!", rating: 5 });
        expect(response.status).to.equal(201);
        expect(response.body.success).to.equal(true);

        const user = await prisma.users.findUnique({ where: { email: TEST_EMAIL } });
        const feedback = await prisma.feedback.findFirst({ where: { user_id: user.id } });
        feedbackId = feedback.id.toString();
    });

    it("5. Should update own feedback when logged in", async () => {
        const response = await agent
            .patch(`/feedback/update/${feedbackId}`)
            .send({ content: "Updated feedback content", rating: 4 });
        expect(response.status).to.equal(200);
        expect(response.body.success).to.equal(true);
    });

    it("6. Should fail to update feedback when NOT logged in", async () => {
        const response = await request(app)
            .patch(`/feedback/update/${feedbackId}`)
            .send({ content: "Hacked content" });
        expect(response.status).to.equal(401);
        expect(response.body.success).to.equal(false);
    });

    it("7. Should fail to delete feedback when NOT logged in", async () => {
        const response = await request(app).delete(`/feedback/delete/${feedbackId}`);
        expect(response.status).to.equal(401);
        expect(response.body.success).to.equal(false);
    });

    it("8. Should delete own feedback when logged in", async () => {
        const response = await agent.delete(`/feedback/delete/${feedbackId}`);
        expect(response.status).to.equal(200);
        expect(response.body.success).to.equal(true);
    });
});
