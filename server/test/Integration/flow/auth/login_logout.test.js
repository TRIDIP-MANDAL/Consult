import request from "supertest";
import { expect } from "chai";
import app from "../../../../index.js"

describe("Auth Flow: Login & Logout test", () => {
    // Use an agent so it automatically remembers and sends cookies for us!
    const agent = request.agent(app);

    it("1. Login Test with valid cedentials", async () => {
        const response = await agent.post("/auth/login")
            .send({
                email: "bokachoda7384@gmail.com",
                password: "Abcd@1234"
            })
        expect(response.status).to.equal(200);
        expect(response.body.success).to.equal(true);
        // The token is sent as a cookie, so we don't expect it in the JSON body
    })

    it("2. Trying to get profile after login", async () => {
        const response = await agent.get("/auth/me")
        expect(response.status).to.equal(200);
        expect(response.body.success).to.equal(true);
    })

    it("3. Trying to logout", async () => {
        const response = await agent.get("/auth/logout")
        expect(response.status).to.equal(200);
        expect(response.body.success).to.equal(true);
    })

    it("4. Trying to get profile after logout", async () => {
        const response = await agent.get("/auth/me")
        expect(response.status).to.equal(401);
        expect(response.body.success).to.equal(false);
    })
})