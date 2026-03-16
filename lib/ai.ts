import { getBaseUrl } from './redux/api/index';

export interface GoalContext {
  text: string;
  deadline?: string;
  progress: number;
  status: string;
}

export async function analyzeGoalRisk(
  goal: GoalContext,
  token: string
): Promise<'on-track' | 'at-risk'> {
  try {
    const response = await fetch(`${getBaseUrl()}/api/ai/analyze-goal-risk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(goal),
    });

    if (!response.ok) {
      console.warn('analyzeGoalRisk: backend returned', response.status);
      return 'on-track';
    }

    const data = await response.json();
    return data.status === 'at-risk' ? 'at-risk' : 'on-track';
  } catch (error) {
    console.error('analyzeGoalRisk failed:', error);
    return 'on-track';
  }
}

export interface GoalUpdateResult {
  goalId: string;
  newProgress: number;
  confidence: number;
}

export async function parseGoalUpdate(
  text: string,
  goals: { id: string; text: string; progress: number }[],
  token: string
): Promise<GoalUpdateResult | null> {
  if (goals.length === 0) return null;

  try {
    const response = await fetch(`${getBaseUrl()}/api/ai/parse-goal-update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text, goals }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.result ?? null;
  } catch (error) {
    console.error('parseGoalUpdate failed:', error);
    return null;
  }
}
