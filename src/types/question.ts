type rawString = { raw: string };
type rawStringArray = { raw: string[] };
export interface QuestionWithRaw {
  id?: rawString;
  question: rawString;
  answer: rawStringArray;
  question_type?: rawString;
  language?: rawString;
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
