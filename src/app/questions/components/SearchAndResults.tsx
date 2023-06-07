import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { IoMdSend } from "react-icons/io";

import QuestionCard from "@/app/questions/components/QuestionCard";
import CustomMenu from "@/shared/CustomMenu";
import CustomPagingInfo from "@/shared/CustomPagingInfo";

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
    direction: "desc"
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
      current: number;
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
      <div className={"relative flex w-full flex-col rounded-md border border-gray-300 bg-zinc-900 py-3 pl-4 "}>
        <textarea
          rows={1}
          className={
            "w-full bg-transparent pr-12 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-0 focus-visible:ring-0"
          }
          placeholder={"Search Questions"}
          style={{
            maxHeight: "200px",
            height: "24px"
          }}
          value={querySearchState.query}
          onChange={(event) => {
            const target = event.target as HTMLTextAreaElement;
            target.style.height = "24px";
            target.style.height = target.scrollHeight + "px";
            console.log(target.value);
            setQuerySearchState({ ...querySearchState, query: target.value });
          }}
        />
        {/*<button className="enabled:bg-brand-purple absolute bottom-1.5 right-2 rounded-md p-1 text-white transition-colors disabled:text-gray-400 disabled:opacity-40 dark:hover:bg-gray-900 dark:disabled:hover:bg-transparent md:bottom-3 md:right-3 md:p-2">*/}
        {/*  <span className="" data-state="closed">*/}
        {/*    <svg*/}
        {/*      xmlns="http://www.w3.org/2000/svg"*/}
        {/*      viewBox="0 0 16 16"*/}
        {/*      fill="none"*/}
        {/*      className="m-1 h-4 w-4 md:m-0"*/}
        {/*      strokeWidth={2}*/}
        {/*    >*/}
        {/*      <path*/}
        {/*        d="M.5 1.163A1 1 0 0 1 1.97.28l12.868 6.837a1 1 0 0 1 0 1.766L1.969 15.72A1 1 0 0 1 .5 14.836V10.33a1 1 0 0 1 .816-.983L8.5 8 1.316 6.653A1 1 0 0 1 .5 5.67V1.163Z"*/}
        {/*        fill="currentColor"*/}
        {/*      ></path>*/}
        {/*    </svg>*/}
        {/*  </span>*/}
        {/*</button>*/}
        <button className={"absolute bottom-2 right-2 flex items-center p-2"}>
          <IoMdSend size={20} />
        </button>
      </div>
      <div className={"grid grid-cols-1 items-center gap-2 duration-150 sm:grid-cols-2"}>
        <CustomPagingInfo
          currentPage={querySearchState.page.current}
          pageSize={querySearchState.page.size}
          totalItems={questions?.meta.page.total_results}
          isLoading={isLoading}
        />

        <div className={"flex flex-row flex-wrap items-center gap-2 duration-150 sm:justify-end"}>
          <div className={"flex items-center justify-end space-x-1.5"}>
            <p className={"text-xs tracking-tight text-zinc-200 md:text-sm "}>Show:</p>
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
      {/* <div className={"relative mt-2 w-fit text-xs md:text-sm"}>
        <button className={"rounded-md bg-zinc-900 p-2 pr-10 ring-2 ring-zinc-600"}>Hello World</button>
        <span className={"absolute inset-y-0 right-0 flex items-center"}>
          <HiChevronDown size={20} className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </span>
      </div>*/}

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
