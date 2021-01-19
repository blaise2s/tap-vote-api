// src/section/section.ts
// src/section/section.ts

import { Question } from '../question/question';

export interface Section {
  name: string;
  questions: Question[];
}
