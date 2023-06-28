<<<<<<< HEAD:src/types/index.ts
export interface Question {
  id?: string;
  question: string;
  answer: string[];
  question_type?: string;
  domain?: string;
  tags?: string[];
}

=======
>>>>>>> dev:src/types/question.ts
type rawString = { raw: string };
type rawStringArray = { raw: string[] };
export interface QuestionWithRaw {
  id?: rawString;
  question: rawString;
  answer: rawStringArray;
  question_type?: rawString;
  domain?: rawString;
  tags?: rawStringArray;
}

export interface QuestionAndAnswer {
  id?: string;
  date?: string;
  question: string;
  answer: string[];
  domain?: string;
  question_type?: string;
  tags?: string[];
}
