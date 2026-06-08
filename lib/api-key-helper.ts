export async function getGroqApiKey(): Promise<string | null> {
  if (process.env.GROQ_API_KEY) {
    return process.env.GROQ_API_KEY;
  }
  try {
    // Next.js running on server side can call the FastAPI backend directly
    const backendUrl = process.env.BACKEND_API_URL || "http://127.0.0.1:8000";
    const res = await fetch(`${backendUrl}/api/backend/profile`, {
      next: { revalidate: 0 } // disable cache for fresh retrieval
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.groq_api_key) {
        return data.groq_api_key;
      }
    }
  } catch (error) {
    console.error("Failed to fetch Groq API Key from FastAPI profile:", error);
  }
  return null;
}
