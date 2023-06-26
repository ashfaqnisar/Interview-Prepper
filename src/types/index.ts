export interface Question {
  id?: string;
  question: string;
  answer: string[];
  question_type?: string;
  domain?: string;
  tags?: string[];
}

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
