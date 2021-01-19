// src/question/question.ts

export enum QuestionType {
  FREE_RESPONSE,
  MULTIPLE_CHOICE_SINGLE_RESPONSE,
  MULTIPLE_CHOICE_MULTIPLE_RESPONSE
}

export interface Question {
  type: QuestionType;
  question: string;
  options: string[];
  answers: string[];
}
