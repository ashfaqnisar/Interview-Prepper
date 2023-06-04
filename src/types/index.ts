export interface Question {
  id?: string;
  question: string;
  answer: string[];
  question_type?: string;
  language?: string;
  tags?: string[];
}

type rawString = { raw: string };
type rawStringArray = { raw: string[] };
export interface QuestionWithRaw {
  id?: rawString;
  question: rawString;
  answer: rawStringArray | rawString;
  question_type?: rawString;
  language?: rawString;
  tags?: rawStringArray;
}

export interface SearchConfigProps {
  engineName: string;
  endpointBase: string;
  searchKey: string;
  resultFields: string[];
  querySuggestFields: string[];
  sortFields: string[];
  facets: string[];
  titleField: string;
  searchFields?: string[];
  fields?: string[];
  urlField?: string;
  thumbnailField?: string;
  hostIdentifier?: string;
}
