export interface WHTheme {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: string;
  buttonStyle: "filled" | "outline";
  fontFamily: string;
}

export interface WHConfig {
  questionText: string;
  positiveLabel: string;
  negativeLabel: string;
  thankYouMessage: string;
  followUpEnabled: boolean;
  followUpType: "textarea" | "poll" | "poll_with_input";
  followUpQuestion: string;
  pollOptions: string[];
  displayMode: "inline" | "compact" | "modal";
  theme: WHTheme;
}

export interface WHProject {
  _id: string;
  name: string;
  description: string;
  userId: string;
  config: WHConfig;
  stats?: ProjectStats;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectStats {
  totalVotes: number;
  upVotes: number;
  downVotes: number;
  totalFeedback: number;
}

export interface Vote {
  _id: string;
  projectId: string;
  vote: "up" | "down";
  sessionId: string;
  pageUrl: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface FeedbackItem {
  _id: string;
  projectId: string;
  sessionId: string;
  voteId: string | null;
  pollAnswer: string;
  textInput: string;
  pageUrl: string;
  createdAt: string;
}

export interface Analytics {
  totalVotes: number;
  upVotes: number;
  downVotes: number;
  helpfulnessRate: number;
  totalFeedback: number;
  followUpRate: number;
  pollDistribution: Record<string, number>;
}

export const DEFAULT_CONFIG: WHConfig = {
  questionText: "Was this helpful?",
  positiveLabel: "Yes, helpful",
  negativeLabel: "Not helpful",
  thankYouMessage: "Thanks for your feedback!",
  followUpEnabled: true,
  followUpType: "textarea",
  followUpQuestion: "What could be improved?",
  pollOptions: ["Missing information", "Confusing explanation", "Wrong answer", "Other"],
  displayMode: "inline",
  theme: {
    primaryColor: "#6366f1",
    backgroundColor: "#ffffff",
    textColor: "#1f2937",
    borderRadius: "8px",
    buttonStyle: "filled",
    fontFamily: "inherit",
  },
};
