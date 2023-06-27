export interface SearchOptions {
  query: string;
  page: {
    size: string;
    current?: string;
  };
  sort: {
    field: string;
    direction?: "asc" | "desc";
  };
}
export interface SearchState extends SearchOptions {
  query: string;
  filter?: {
    [key: string]: string[];
  };
}
