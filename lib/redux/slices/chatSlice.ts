import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Message {
  id: string;
  type: 'ai' | 'user';
  text: string;
  goalSuggestion?: {
    text: string;
    deadline: string;
    emoji: string;
    saved?: boolean;
    savedId?: string;
  };
  habitSuggestion?: {
    name: string;
    emoji: string;
    frequency: string;
    reminderTime: string;
    saved?: boolean;
    savedId?: string;
  };
  progressUpdateSuggestion?: {
    goalId: string;
    goalTitle: string;
    oldProgress: number;
    newProgress: number;
    saved?: boolean;
  };
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  lastMessageAt: number;
  messages: Message[];
}

interface ChatState {
  sessions: Record<string, ChatSession>;
  activeSessionId: string | null;
}

const initialState: ChatState = {
  sessions: {},
  activeSessionId: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    createSession: (state, action: PayloadAction<{ id: string; initialMessage?: Message }>) => {
      const { id, initialMessage } = action.payload;
      state.sessions[id] = {
        id,
        title: 'New Chat',
        createdAt: Date.now(),
        lastMessageAt: Date.now(),
        messages: initialMessage ? [initialMessage] : [],
      };
      state.activeSessionId = id;
    },
    addMessage: (state, action: PayloadAction<{ sessionId: string; message: Message }>) => {
      const { sessionId, message } = action.payload;
      const session = state.sessions[sessionId];
      if (session) {
        session.messages.push(message);
        session.lastMessageAt = Date.now();
        
        // Auto-generate title from first user message if it's "New Chat"
        if (session.title === 'New Chat' && message.type === 'user') {
          session.title = message.text.slice(0, 30) + (message.text.length > 30 ? '...' : '');
        }
      }
    },
    markProposalSaved: (state, action: PayloadAction<{ sessionId: string; messageId: string; savedId?: string; type: 'habit' | 'goal' }>) => {
      const { sessionId, messageId, savedId, type } = action.payload;
      const session = state.sessions[sessionId];
      if (session) {
        const message = session.messages.find(m => m.id === messageId);
        if (message) {
          if (type === 'habit' && message.habitSuggestion) {
            message.habitSuggestion.saved = true;
            message.habitSuggestion.savedId = savedId;
          } else if (type === 'goal' && message.goalSuggestion) {
            message.goalSuggestion.saved = true;
            message.goalSuggestion.savedId = savedId;
          }
        }
      }
    },
    setActiveSession: (state, action: PayloadAction<string>) => {
      state.activeSessionId = action.payload;
    },
    deleteSession: (state, action: PayloadAction<string>) => {
      const idToDelete = action.payload;
      delete state.sessions[idToDelete];
      if (state.activeSessionId === idToDelete) {
        state.activeSessionId = null; 
      }
    },
    // Optional: Clear all history
    clearAllHistory: (state) => {
      state.sessions = {};
      state.activeSessionId = null;
    }
  },
});

export const { createSession, addMessage, markProposalSaved, setActiveSession, deleteSession, clearAllHistory } = chatSlice.actions;
export default chatSlice.reducer;
