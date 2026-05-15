export interface ContextProvider<T> {
  name: string;
  provide(): Promise<T>;
}

export interface ProblemContext {
  title: string;
  description: string;
}

export interface CodeContext {
  code: string;
  language: string;
}
