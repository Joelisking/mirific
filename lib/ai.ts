
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

export interface GoalContext {
  text: string;
  deadline?: string;
  progress: number;
  status: string;
}

export async function analyzeGoalRisk(goal: GoalContext): Promise<'on-track' | 'at-risk'> {
  if (!OPENAI_API_KEY) {
    console.warn('OpenAI API key is missing. Falling back to default logic.');
    return 'on-track'; // Fallback default
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    
    const messages = [
      {
        role: "system",
        content: `You are an AI goal coach. Your job is to analyze if a user is "at-risk" of missing their goal or if they are "on-track".
        
        Rules:
        1. Consider the linear progress vs time elapsed.
        2. Consider the difficulty. 
        3. Be lenient for early stages (first 25% of timeline).
        4. Be strict for late stages (last 25% of timeline).
        5. Return ONLY the string "on-track" or "at-risk".`
      },
      {
        role: "user",
        content: `Analyze this goal status as of today (${today}):
        Goal: "${goal.text}"
        Deadline: ${goal.deadline || "None"}
        Current Progress: ${goal.progress}%
        current system status: ${goal.status}
        
        Is this goal at-risk or on-track?`
      }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", // Use 3.5 for speed/cost, or 4o if preferred
        messages: messages,
        temperature: 0.5,
        max_tokens: 10
      })
    });

    const data = await response.json();
    
    if (data.error) {
      console.error('OpenAI API Error:', data.error);
      return 'on-track'; // Fallback
    }

    const result = data.choices?.[0]?.message?.content?.trim().toLowerCase();

    if (result && (result.includes('at-risk') || result.includes('at risk'))) {
      return 'at-risk';
    } 
    
    return 'on-track';

  } catch (error) {
    console.error('Failed to analyze goal risk:', error);
    return 'on-track'; // Fallback
  }
}
