"use client";

import { useCallback, useState } from "react";

import { SearchOptions, SearchState } from "@/types/search";
import DomainFilterList from "@/app/components/domain-filter-list";
import QueryBar from "@/app/components/query-bar";
import Results from "@/app/components/results";

const defaultQueryState: SearchState = {
  query: "",
  page: {
    size: 25,
  },
  sort: {
    field: "id",
    order: "asc",
  },
};

const IndexPage = () => {
  const [queryState, setQueryState] = useState<SearchState>(defaultQueryState);

  const updateQueryState = useCallback(
    (newQueryState: SearchOptions) => {
      setQueryState(newQueryState);
    },
    [queryState]
  );
  const updateCurrentPage = useCallback(
    (newPage: number) => {
      setQueryState({
        ...queryState,
        page: {
          ...queryState.page,
          current: newPage,
        },
      });
    },
    [queryState]
  );

  return (
    <section className="container grid max-w-4xl items-center gap-4 px-4 pb-8 pt-6">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        <div>
          <h1 className="scroll-m-20 text-2xl font-extrabold tracking-tight 2xl:text-3xl">
            Questions
          </h1>
          <p className="text-sm leading-7 text-muted-foreground 2xl:text-base 2xl:tracking-tight">
            Explore the questions of different technical domains.
          </p>
        </div>
      </div>
      <DomainFilterList
        updateDomain={(domain) => {
          if (!domain || domain === "") {
            //Remove the filter if the domain is empty
            const { filters, ...rest } = queryState;
            setQueryState(rest);
          } else {
            setQueryState({
              ...queryState,
              filters: {
                domain: [domain],
              },
            });
          }
        }}
      />
      <QueryBar updateQuery={updateQueryState} queryState={queryState} />
      <Results queryState={queryState} updatePage={updateCurrentPage} />
    </section>
  );
};
export default IndexPage;
