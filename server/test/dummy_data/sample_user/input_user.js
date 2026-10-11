import { expect } from "chai";
import request from "supertest";
import app from "../../../index.js";
import redis from "../../../lib/redis.js";
import signupData from "../../Integration/data/signup.json" with { type: "json" };

describe("Seed Dummy User to DB", () => {
    
    before(async () => {
        signupData.user.email = "xyz@gmail.com";
        signupData.user.phone = "+919431518538";
        await redis.setex(`otp:${signupData.user.email}:verified`, 600, true);
        await redis.setex(`otp:${signupData.user.phone}:verified`, 600, true);
    });

    after(async () => {
        await redis.del(`otp:${signupData.user.email}:verified`);
        await redis.del(`otp:${signupData.user.phone}:verified`);
    });

    it("Should successfully insert the dummy user to the database", async () => {
        const response = await request(app)
            .post("/auth/signup")
            .send(signupData);

        if (response.status === 409) {
            console.log("⚠️ User already exists in DB.");
            expect(response.status).to.equal(409);
        } else {
            expect(response.status).to.equal(201);
            expect(response.body.success).to.equal(true);
            console.log("✅ Dummy user successfully added!");
        }
    });
});
