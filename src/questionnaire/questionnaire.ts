// src/questionnaire/questionnaire.ts

import { Section } from '../section/section';

export interface Questionnaire {
  id?: string;
  name: string;
  sections: Section[];
}
