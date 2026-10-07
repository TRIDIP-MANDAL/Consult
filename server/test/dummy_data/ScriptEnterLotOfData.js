import Mockusers from "./mentor_mock_data/mentor_payloads.json" with { type: "json" };
import MockFeedbacks from "./feedback_mock_data/feedback_data.json" with { type: "json" };
import prisma from "../../model/db.js";
// Mockusers.forEach((v)=>{
//     setTimeout(async ()=>{
//         const response = await fetch("http://localhost:5100/auth/signup", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json"
//             },
//             body: JSON.stringify(v)
//         });
//     const data = await response.json();
//     console.log("entered ",v.user.full_name," status ", data.success)
//     }, 3000)
// })
async function writeInDB(){
    const formattedData = MockFeedbacks.map(fb => ({
        user_id: BigInt(fb.user_id),
        rating: fb.rating,
        content: fb.content
    }));
    try {
        const result = await prisma.feedback.createMany({
            data: formattedData,
            skipDuplicates: true // Skips any where user_id already exists!
        });
        console.log(`Successfully bulk inserted ${result.count} feedbacks.`);
    } catch (error) {
        console.error("Bulk insert failed:", error);
    }
}

writeInDB().catch(console.error).finally(() => prisma.$disconnect());