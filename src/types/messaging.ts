import type { Settings, ProblemData, Hint } from './index';

export type MessageAction = 
  | 'GET_PROBLEM_DATA'
  | 'GENERATE_HINT'
  | 'PROXY_GET_PROBLEM_DATA'
  | 'START_HINT_STREAM'
  | 'LEETCODE_HINTER_LOCK';

export interface BaseMessage {
  action: MessageAction;
  payload?: any;
}

export interface ProxyGetProblemDataMessage extends BaseMessage {
  action: 'PROXY_GET_PROBLEM_DATA';
}

export interface GenerateHintMessage extends BaseMessage {
  action: 'GENERATE_HINT';
  payload: {
    settings: Settings;
    problemData: ProblemData;
    hints: Hint[];
  };
}

export interface StartHintStreamMessage {
  action: 'START_HINT_STREAM';
  payload: {
    settings: Settings;
    problemData: ProblemData;
    hints: Hint[];
  };
}

export interface LockMessage {
  type: 'LEETCODE_HINTER_LOCK';
  locked: boolean;
}

export type StreamResponse = 
  | { type: 'chunk'; content: string }
  | { type: 'done' }
  | { type: 'error'; message: string };
