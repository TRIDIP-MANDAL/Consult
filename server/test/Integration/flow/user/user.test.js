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

describe("User Flow: Profile", () => {
    const agent = request.agent(app);
    let userId = null;

    before(async () => {
        await seedUser();

        const loginRes = await agent.post("/auth/login").send({
            email: TEST_EMAIL,
            password: TEST_PASSWORD
        });
        expect(loginRes.status).to.equal(200);
        userId = loginRes.body.data.id;
    });

    after(async () => {
        await cleanupUser();
    });

    it("1. Should load own profile when logged in", async () => {
        const response = await agent.get(`/user/profile/${userId}`);
        expect(response.status).to.equal(200);
        expect(response.body.success).to.equal(true);
        expect(response.body.data).to.have.property("full_name");
        expect(response.body.data).to.not.have.property("password");
    });

    it("2. Should fail to load profile when NOT logged in", async () => {
        const response = await request(app).get(`/user/profile/${userId}`);
        expect(response.status).to.equal(401);
        expect(response.body.success).to.equal(false);
    });

    it("3. Should fail to load profile for a non-existent user ID", async () => {
        const response = await agent.get(`/user/profile/999999999`);
        expect(response.status).to.equal(404);
        expect(response.body.success).to.equal(false);
    });

    it("4. Should update own profile successfully", async () => {
        const response = await agent
            .patch(`/user/editprofile/${userId}`)
            .send({
                user: { full_name: "Updated Test Name", country: "US" },
                audit: { user_id: userId, role: "USER" }
            });
        expect(response.status).to.equal(200);
        expect(response.body.success).to.equal(true);
    });

    it("5. Should reject email/phone update (feature blocked)", async () => {
        const response = await agent
            .patch(`/user/editprofile/${userId}`)
            .send({
                user: { email: "newemail@test.com" },
                audit: { user_id: userId, role: "USER" }
            });
        expect(response.status).to.equal(400);
        expect(response.body.success).to.equal(false);
    });

    it("6. Should fail to update profile when NOT logged in", async () => {
        const response = await request(app)
            .patch(`/user/editprofile/${userId}`)
            .send({
                user: { full_name: "Hacker" },
                audit: { user_id: userId, role: "USER" }
            });
        expect(response.status).to.equal(401);
        expect(response.body.success).to.equal(false);
    });

    it("7. Should load mentors list (public route, no login needed)", async () => {
        const response = await request(app).get("/user/our-mentors");
        expect(response.status).to.equal(200);
        expect(response.body.success).to.equal(true);
        expect(response.body.data).to.be.an("array");
    });

    it("8. Should filter mentors by expertise query param", async () => {
        const response = await request(app).get("/user/our-mentors?expertise=EXPERT");
        expect(response.status).to.equal(200);
        expect(response.body.success).to.equal(true);
    });

    it("9. Should return mentor suggestions for a valid query", async () => {
        const response = await request(app).get("/user/our-mentors/suggestions?q=test");
        expect(response.status).to.equal(200);
        expect(response.body.success).to.equal(true);
        expect(response.body.data).to.be.an("array");
    });

    it("10. Should return empty array for a 1-char query (below minimum)", async () => {
        const response = await request(app).get("/user/our-mentors/suggestions?q=");
        expect(response.status).to.equal(200);
        expect(response.body.data).to.deep.equal([]);
    });

    it("11. Should deactivate (soft-delete) own profile", async () => {
        const response = await agent.delete(`/user/deleteprofile/${userId}`);
        expect(response.status).to.equal(200);
        expect(response.body.success).to.equal(true);
    });
});
