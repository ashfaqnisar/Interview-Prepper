export interface SearchOptions {
  query: string;
  page: {
    size: number;
    current?: number;
  };
  sort?: {
    field: string;
    order?: "asc" | "desc";
  };
}
export interface SearchState extends SearchOptions {
  query: string;
  filters?: {
    [key: string]: string[];
  };
}
