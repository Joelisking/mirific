
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

export interface GoalUpdateResult {
  goalId: string;
  newProgress: number;
  confidence: number;
}

export async function parseGoalUpdate(text: string, goals: { id: string; text: string; progress: number }[]): Promise<GoalUpdateResult | null> {
  if (!OPENAI_API_KEY || goals.length === 0) {
    return null;
  }

  try {
    const goalsList = goals.map(g => `- ID: "${g.id}", Title: "${g.text}", Current Progress: ${g.progress}%`).join('\n');
    
    const messages = [
      {
        role: "system",
        content: `You are an AI assistant that detects if a user is reporting progress on a goal.
        
        Goals List:
        ${goalsList}
        
        Rules:
        1. If the user's message indicates progress, try to find the BEST MATCHING goal from the list.
        2. If the user says "I did 5 more", add that to the current progress.
        3. If the user says "I am at 50%", that is the new progress for the matched goal.
        4. If the user says "halfway", "half way", or "middle", that means 50%.
        5. If the user says "quarter way", that means 25%. "Almost done" means ~90%. "Done" or "Finished" means 100%.
        6. FUZZY MATCHING IS REQUIRED. "AI Agent" matches "Become an AI Agent Developer". "Reading" matches "Read 10 books".
        7. If a goal is matched, return a JSON object: { "goalId": "...", "newProgress": number, "confidence": number (0-1) }.
        8. If absolutely no goal matches, return "null".
        9. VALID JSON ONLY.`
      },
      {
        role: "user",
        content: text
      }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: messages,
        temperature: 0.1,
        max_tokens: 100
      })
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    
    if (!content || content === 'null') return null;

    try {
      const result = JSON.parse(content);
      // Lower confidence threshold slightly to be more permissive
      if (result.goalId && typeof result.newProgress === 'number' && result.confidence > 0.6) {
        return result;
      }
    } catch (e) {
      console.warn('Failed to parse AI goal update response', content);
    }
    
    return null;

  } catch (error) {
    console.error('Error parsing goal update:', error);
    return null;
  }
}
