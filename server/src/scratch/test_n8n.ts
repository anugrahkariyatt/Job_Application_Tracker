import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const n8nUrl = process.env.N8N_WEBHOOK_URL || "http://localhost:5678/webhook";

console.log(`\n==============================================`);
console.log(`🚀 Starting n8n Webhook Test Pipeline`);
console.log(`🔗 Target Webhook URL: ${n8nUrl}`);
console.log(`==============================================\n`);

async function testPayload(name: string, endpointPath: string, payload: any) {
  const fullUrl = `${n8nUrl}${endpointPath}`;
  console.log(`▶ Testing Payload: [${name}] -> ${fullUrl}`);
  try {
    const res = await axios.post(fullUrl, payload, {
      headers: { "Content-Type": "application/json" },
      timeout: 5000,
    });
    console.log(`  ✅ SUCCESS (${res.status}):`, res.data || "OK");
  } catch (err: any) {
    if (err.response) {
      console.log(`  ⚠️ RESPONSE ERROR (${err.response.status}):`, err.response.data);
    } else if (err.code === "ECONNREFUSED") {
      console.log(`  ❌ CONNECTION REFUSED: n8n is not listening on ${fullUrl}`);
      console.log(`     👉 Make sure n8n is running and the Webhook node is in "Test" or "Active" state.`);
    } else {
      console.log(`  ❌ FAILED: ${err.message}`);
    }
  }
  console.log(`----------------------------------------------\n`);
}

async function runAllTests() {
  // 1. Verification Email
  await testPayload("1. Email Verification", "/send-email", {
    type: "verification",
    email: "test.candidate@example.com",
    verificationLink: "http://localhost:3000/verify-email?token=test_token_123",
  });

  // 2. Application Submitted
  await testPayload("2. Application Submitted Confirmation", "/send-email", {
    type: "application-submitted",
    email: "test.candidate@example.com",
    candidateName: "Alex Developer",
    jobTitle: "Senior Full Stack Engineer",
    companyName: "Techno Careers Inc",
    applicationDate: new Date().toLocaleDateString(),
  });

  // 3. Interview Scheduled
  await testPayload("3. Interview Scheduled Invitation", "/send-email", {
    type: "interview-scheduled",
    interviewType: "Technical Round",
    email: "test.candidate@example.com",
    candidateName: "Alex Developer",
    jobTitle: "Senior Full Stack Engineer",
    companyName: "Techno Careers Inc",
    interviewTitle: "Technical Deep Dive Round 1",
    dateTime: "2026-07-25 10:00 AM EST",
    link: "https://meet.google.com/abc-defg-hij",
  });

  // 4. Payment Success Receipt
  await testPayload("4. Payment Success Receipt", "/send-email", {
    type: "payment-success",
    email: "test.candidate@example.com",
    userName: "Alex Developer",
    planName: "CANDIDATE-PRO",
    amount: "$9.99",
    expiresAt: "8/22/2026",
  });

  // 5. AI Candidate Screening
  await testPayload("5. Candidate AI Resume Screening", "/ai-screen-candidate", {
    applicationId: "test_app_669fc9876",
    candidateName: "Alex Developer",
    candidateEmail: "test.candidate@example.com",
    candidateSkills: ["React", "TypeScript", "Node.js", "MongoDB"],
    candidateExperienceSummary: "Full Stack Engineer with 4 years building scalable web apps.",
    jobTitle: "Senior Full Stack Engineer",
    jobDescription: "Seeking a developer skilled in React, TypeScript, and Node.js.",
    jobRequiredSkills: ["React", "Node.js", "TypeScript"],
  });
}

runAllTests();
