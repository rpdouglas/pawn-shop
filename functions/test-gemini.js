const { GoogleGenerativeAI } = require('@google/generative-ai');

async function run() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'dummy') {
    console.error("❌ Error: Please provide a valid GEMINI_API_KEY environment variable.");
    console.error("Usage: GEMINI_API_KEY='your_live_key_here' node test-gemini.js");
    process.exit(1);
  }

  console.log("Testing Gemini API...");
  console.log("Contacting Google servers...");
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro-latest" });
    const flashModel = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    
    let result;
    try {
      result = await model.generateContent("Write a one-sentence witty welcome message for a Pawn Shop located in Akwesasne.");
    } catch (err) {
      if (err.message && err.message.includes('429')) {
        console.log("⚠️  Gemini Pro Quota Exceeded (429). Dynamically falling back to Gemini Flash...");
        result = await flashModel.generateContent("Write a one-sentence witty welcome message for a Pawn Shop located in Akwesasne.");
      } else {
        throw err;
      }
    }
    
    const response = await result.response;
    
    console.log("\n✅ SUCCESS! Your API Key is valid. Gemini responded with:");
    console.log("---------------------------------------------------------");
    console.log(response.text().trim());
    console.log("---------------------------------------------------------");
    console.log("You are safe to deploy this key to Google Cloud Secret Manager!");
    
  } catch (error) {
    console.error("\n❌ FAILED. Gemini returned an error:");
    console.error(error.message);
  }
}

run();
