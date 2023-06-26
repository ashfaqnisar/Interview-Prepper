"use client";

import { useState } from "react";

import DomainFilterList from "@/app/components/domain-filter-list";
import SearchBar from "@/app/components/search-bar";

const IndexPage = () => {
  const [queryState, setQueryState] = useState({
    domain: "",
    query: "",
  });

  return (
    <section className="container grid items-center gap-4 pb-8 pt-6">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        <div>
          <h1 className="scroll-m-20 text-2xl font-extrabold tracking-tight 2xl:text-3xl">
            Questions
          </h1>
          <p className="text-sm leading-5 text-muted-foreground 2xl:text-base 2xl:tracking-tight">
            Explore the questions of different technical domains.
          </p>
        </div>
      </div>
      <DomainFilterList
        updateDomain={(domain) => {
          setQueryState({
            ...queryState,
            domain,
          });
        }}
      />
      <SearchBar
        updateQuery={(query: string) => {
          console.log("update query");
          setQueryState({
            ...queryState,
            query,
          });
        }}
      />
      <h3>Results</h3>
      <h3>Pagination</h3>
    </section>
  );
};
export default IndexPage;
