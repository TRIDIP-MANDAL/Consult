import request from "supertest"
import app from "../../../../index.js"
import { expect } from "chai"
import redis from "../../../../lib/redis.js"
import data from "../../data/signup.json" with { type: "json" };
import prisma from "../../../../model/db.js"

describe("Auth Flow : SignUp", ()=>{
    const successMail = "success32@test.com";
    const succssPh = "+919431518538";

    const mail2 = "seconduser21321231@test.com";
    const phone2 = "+919431518539";

    before(async ()=>{
        await redis.set(`otp:${successMail}:verified`,true);
        await redis.set(`otp:${succssPh}:verified`,true);

        await redis.set(`otp:${mail2}:verified`,true);
        await redis.set(`otp:${phone2}:verified`,true);
    })

    it("SignUp Successfully", async()=>{
        data.user.email = successMail;
        data.user.phone = succssPh;

        const response = await request(app)
            .post("/auth/signup")
            .send(data);
        expect(response.status).to.equal(201);
        expect(response.body.success).to.equal(true);
        console.log(response.body.message)
    })

    it("SignUp with already registered email", async()=>{
        data.user.email = successMail;
        data.user.phone = phone2;

        const response = await request(app)
            .post("/auth/signup")
            .send(data);
        expect(response.status).to.equal(400);
        expect(response.body.success).to.equal(false);
    })

    it("SignUp with already registered phone", async()=>{
        data.user.email = mail2;
        data.user.phone = succssPh;

        const response = await request(app)
            .post("/auth/signup")
            .send(data);
        expect(response.status).to.equal(400);
        expect(response.body.success).to.equal(false);
    })

    it("SignUp with invalid email", async()=>{
        data.user.email = "invalid-email";
        data.user.phone = phone2;

        const response = await request(app)
            .post("/auth/signup")
            .send(data);
        expect(response.status).to.equal(400);
        expect(response.body.success).to.equal(false);
    })

    it("SignUp with invalid phone", async()=>{
        data.user.email = mail2;
        data.user.phone = "invalid-phone";

        const response = await request(app)
            .post("/auth/signup")
            .send(data);
        expect(response.status).to.equal(400);
        expect(response.body.success).to.equal(false);
    })

    it("SignUp with invalid password", async()=>{
        data.user.email = mail2;
        data.user.phone = phone2;
        data.user.password = "weakpassword";

        const response = await request(app)
            .post("/auth/signup")
            .send(data);
        expect(response.status).to.equal(400);
        expect(response.body.success).to.equal(false);
        
        // Restore password for next tests
        data.user.password = "SecurePassword123!";
    })
    
    it("SignUp when already logged in", async ()=>{
        const agent = request.agent(app);
        
        const response = await agent
            .post("/auth/login")
            .send({
                email : successMail,
                password : data.user.password
            });
        expect(response.status).to.equal(200);
        expect(response.body.success).to.equal(true);

        const signupResponse = await agent
            .post("/auth/signup")
            .send(data);
        expect(signupResponse.status).to.equal(400);
        expect(signupResponse.body.success).to.equal(false);
    })

    after(async()=>{
        await redis.del(`otp:${successMail}:verified`);
        await redis.del(`otp:${succssPh}:verified`);
        await redis.del(`otp:${mail2}:verified`);
        await redis.del(`otp:${phone2}:verified`);

        // Clean up test data from the database
        await prisma.users.deleteMany({
            where: {
                OR: [
                    { email: { in: [successMail, mail2] } },
                    { phone: { in: [succssPh, phone2] } }
                ]
            }
        });
    })
    
})    