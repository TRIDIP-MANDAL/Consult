import fs from 'fs';
import path from 'path';

const userIds = [
  51, 52, 53, 54, 55, 45, 46, 47, 48, 49, 50, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66
];

const mockContents = [
    "Great platform! Highly recommended.",
    "The mentors are very knowledgeable and helpful.",
    "I got a lot of value out of my sessions.",
    "Very easy to use and schedule meetings.",
    "The video call quality was excellent.",
    "Helped me land my dream job!",
    "Could use some improvements in UI, but overall good.",
    "The best career advice I have received.",
    "Flexible scheduling and great mentors.",
    "I wish I found this platform sooner.",
    "It was a game changer for my professional growth.",
    "My mentor provided clear, actionable steps.",
    "I cannot recommend this platform enough to everybody!",
    "Absolutely transformative experience."
];

function generateFeedbackJSON() {
    console.log("Generating feedback data...");
    
    const feedbackList = [];
    
    for (const userId of userIds) {
        const randomRating = Math.floor(Math.random() * 3) + 3; // 3 to 5 stars
        const randomContent = mockContents[Math.floor(Math.random() * mockContents.length)];
        
        feedbackList.push({
            user_id: userId,
            rating: randomRating,
            content: randomContent
        });
    }
    
    const outputPath = path.join(process.cwd(), 'feedback_data.json');
    fs.writeFileSync(outputPath, JSON.stringify(feedbackList, null, 2));
    
    console.log(`Successfully generated ${feedbackList.length} feedbacks and saved to ${outputPath}`);
}

generateFeedbackJSON();
