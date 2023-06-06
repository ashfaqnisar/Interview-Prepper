import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import QuestionCard from "@/app/questions/components/QuestionCard";
import CustomMenu from "@/shared/CustomMenu";

const SORT_OPTIONS: {
  name: string;
  field: string;
  direction?: string;
}[] = [
  {
    name: "relevance",
    field: "relevance"
  },
  {
    name: "id - asc",
    field: "id",
    direction: "asc"
  },
  {
    name: "id - desc",
    field: "id",
    direction: "asc"
  }
];

const PAGE_OPTIONS: { size: number }[] = [
  {
    size: 10
  },
  {
    size: 25
  },
  {
    size: 50
  },
  {
    size: 100
  }
];

const SearchAndResults = ({ technologyFilter }: { technologyFilter: string }) => {
  const [querySearchState, setQuerySearchState] = useState<{
    query: string;
    sort: {
      field: string | number;
      direction?: string;
    };
    page: {
      size: number;
      current?: number;
    };
  }>({
    query: "",
    sort: SORT_OPTIONS[0],
    page: {
      size: PAGE_OPTIONS[0].size,
      current: 1
    }
  });

  const {
    data: questions,
    isLoading,
    status: questionStatus
  } = useQuery({
    queryKey: ["questions", technologyFilter, querySearchState],
    queryFn: async ({ signal }) => {
      const res = await axios({
        method: "POST",
        url: `${process.env.NEXT_PUBLIC_APP_SEARCH_ENDPOINT}/api/as/v1/engines/${process.env.NEXT_PUBLIC_ENGINE_NAME}/search`,
        data: {
          query: "",
          ...(technologyFilter && {
            filters: {
              language: [technologyFilter]
            }
          }),
          ...(querySearchState.sort.field !== "relevance" && {
            sort: {
              [querySearchState.sort.field]: querySearchState.sort.direction
            }
          }),
          page: querySearchState.page
        },
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_APP_SEARCH_KEY}`
        },
        signal
      });
      return res.data;
    }
  });

  const updateSortOption = (option: { name: string; field: string | number; direction?: string }) => {
    setQuerySearchState({
      ...querySearchState,
      sort: option
    });
  };
  const updateResultsPerPage = (option: { size: number }) => {
    setQuerySearchState({
      ...querySearchState,
      page: {
        ...querySearchState.page,
        size: option.size
      }
    });
  };

  return (
    <>
      <div className={"relative"}>
        <textarea
          rows={1}
          className={
            "-mb-2 block w-full rounded-md border border-gray-300 bg-zinc-900 px-4 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          }
          placeholder={"Search Questions"}
          value={querySearchState.query}
          onChange={(event) => {
            const target = event.target as HTMLTextAreaElement;
            target.style.height = "30px";
            target.style.height = target.scrollHeight + "px";
            setQuerySearchState({ ...querySearchState, query: target.value });
          }}
        />
      </div>
      <div className={"mt-2 grid grid-cols-2 items-center"}>
        <div>Showing Pagination Count</div>
        <div className={"flex flex-row items-center justify-end space-x-3"}>
          <div className={"flex items-center justify-end space-x-1.5"}>
            <p className={"text-xs tracking-tight text-zinc-200 md:text-sm"}>Show:</p>
            <CustomMenu
              options={PAGE_OPTIONS}
              value={querySearchState.page}
              onChange={updateResultsPerPage}
              valueKey={"size"}
            />
          </div>
          <div className={"flex w-fit items-center justify-end space-x-1.5"}>
            <p className={"text-xs tracking-tight text-zinc-200 md:text-sm"}>Sort By:</p>
            <CustomMenu
              options={SORT_OPTIONS}
              value={querySearchState.sort}
              onChange={updateSortOption}
              valueKey={"name"}
            />
          </div>
        </div>
      </div>

      {isLoading && <div>Loading...</div>}
      {!isLoading && questions && (
        <div className={"mt-2 grid gap-4"}>
          {questions.results.map((question: { id: { raw: string }; question: string }) => (
            <QuestionCard result={question} key={question.id.raw} editable />
          ))}
        </div>
      )}
      <div>Pagination</div>
    </>
  );
};

export default SearchAndResults;
