import request from "supertest";
import { expect } from "chai";
import app from "../../../../index.js";
import prisma from "../../../../model/db.js";
import redis from "../../../../lib/redis.js";
import userData from "../../data/test_user.json" with { type: "json" };

const TEST_EMAIL = "integration_test_user@test.com";
const TEST_PHONE = "+919999999901";
const TEST_PASSWORD = "TestPass@1234";
const RESET_PASSWORD = "NewSecure@9999";

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

describe("Auth Flow: Forgot / Reset Password", () => {

    before(async () => {
        await seedUser();
    });

    after(async () => {
        await cleanupUser();
    });

    it("1. Should reset password successfully with a valid reset token", async () => {
        const fakeResetToken = "test-reset-token-abc123";
        await redis.set(
            `reset-token:${fakeResetToken}`,
            JSON.stringify({ identifier: TEST_EMAIL })
        );

        const response = await request(app)
            .patch("/auth/reset-passwd")
            .send({
                email: TEST_EMAIL,
                password: RESET_PASSWORD,
                resetToken: fakeResetToken
            });

        expect(response.status).to.equal(200);
        expect(response.body.success).to.equal(true);
    });

    it("2. Should fail to reset password with an invalid / expired reset token", async () => {
        const response = await request(app)
            .patch("/auth/reset-passwd")
            .send({
                email: TEST_EMAIL,
                password: RESET_PASSWORD,
                resetToken: "this-token-does-not-exist"
            });

        expect(response.status).to.equal(400);
        expect(response.body.success).to.equal(false);
    });

    it("3. Should fail to reset password when no reset token is provided", async () => {
        const response = await request(app)
            .patch("/auth/reset-passwd")
            .send({
                email: TEST_EMAIL,
                password: RESET_PASSWORD
            });

        expect(response.status).to.equal(400);
        expect(response.body.success).to.equal(false);
    });

    it("4. Should fail when reset token identifier doesn't match the provided email", async () => {
        const fakeResetToken = "test-reset-token-mismatch";
        await redis.set(
            `reset-token:${fakeResetToken}`,
            JSON.stringify({ identifier: "different-email@test.com" })
        );

        const response = await request(app)
            .patch("/auth/reset-passwd")
            .send({
                email: TEST_EMAIL,
                password: RESET_PASSWORD,
                resetToken: fakeResetToken
            });

        expect(response.status).to.equal(403);
        expect(response.body.success).to.equal(false);

        await redis.del(`reset-token:${fakeResetToken}`);
    });

    it("5. Should fail to reset when already logged in (restrictAuth blocks it)", async () => {
        const agent = request.agent(app);

        const loginRes = await agent.post("/auth/login").send({
            email: TEST_EMAIL,
            password: RESET_PASSWORD
        });
        expect(loginRes.status).to.equal(200);

        const fakeResetToken = "test-reset-token-loggedin";
        await redis.set(
            `reset-token:${fakeResetToken}`,
            JSON.stringify({ identifier: TEST_EMAIL })
        );
        const response = await agent
            .patch("/auth/reset-passwd")
            .send({
                email: TEST_EMAIL,
                password: "AnotherPass@123",
                resetToken: fakeResetToken
            });

        expect(response.status).to.equal(400);
        expect(response.body.success).to.equal(false);

        await redis.del(`reset-token:${fakeResetToken}`);
    });
});
