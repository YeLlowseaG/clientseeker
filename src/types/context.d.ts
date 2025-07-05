import { ReactNode } from "react";
import { User } from "./user";

export interface ContextValue {
  theme: string;
  setTheme: (theme: string) => void;
  showSignModal: boolean;
  setShowSignModal: (show: boolean) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  promptGoogleOneTap: () => void;
  showFeedback: boolean;
  setShowFeedback: (show: boolean) => void;
  [propName: string]: any;
}
