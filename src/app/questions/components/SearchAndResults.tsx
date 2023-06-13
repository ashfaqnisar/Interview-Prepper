import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BiSend } from "react-icons/bi";
import { HiX } from "react-icons/hi";

import QuestionCard from "@/app/questions/components/QuestionCard";
import CustomMenu from "@/shared/CustomMenu";
import CustomPagination from "@/shared/CustomPagination";
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
    name: "SID - asc",
    field: "sid",
    direction: "asc"
  },
  {
    name: "SID - desc",
    field: "sid",
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

interface QuerySearchStateType {
  query: "";
  sort: {
    field: string | number;
    direction?: string;
    name?: string;
  };
  page: {
    size: number;
    current: number;
  };
}

const DEFAULT_QUERY_SEARCH_STATE: QuerySearchStateType = {
  query: "",
  sort: SORT_OPTIONS[0],
  page: {
    size: PAGE_OPTIONS[0].size,
    current: 1
  }
};

const SearchAndResults = ({ technologyFilter }: { technologyFilter: string }) => {
  const [querySearchState, setQuerySearchState] = useState<QuerySearchStateType>(DEFAULT_QUERY_SEARCH_STATE);

  const { data: questions, isLoading } = useQuery({
    queryKey: ["questions", { technologyFilter }, querySearchState],
    queryFn: async ({ signal }) => {
      const res = await axios({
        method: "POST",
        url: `${process.env.NEXT_PUBLIC_APP_SEARCH_ENDPOINT}/api/as/v1/engines/${process.env.NEXT_PUBLIC_ENGINE_NAME}/search`,
        data: {
          query: querySearchState.query,
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
    },
    keepPreviousData: true,
    staleTime: 20 * 1000,
    initialDataUpdatedAt: Date.now()
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
        current: 1,
        size: option.size
      }
    });
  };

  const updatePage = (newPage: number) => {
    setQuerySearchState({
      ...querySearchState,
      page: {
        ...querySearchState.page,
        current: newPage
      }
    });
  };

  return (
    <>
      <form
        className={"relative flex w-full flex-col rounded-md border border-gray-300 bg-zinc-900 py-3 pl-4 "}
        onSubmit={(event) => {
          event.preventDefault();
          const target = event.target as HTMLFormElement;
          const query = target["search-textarea"].value;
          setQuerySearchState({
            ...querySearchState,
            query,
            sort: SORT_OPTIONS[0],
            page: {
              ...querySearchState.page,
              current: 1
            }
          });
        }}
      >
        <textarea
          name={"search-textarea"}
          rows={1}
          className={
            "w-full resize-none bg-transparent pr-12 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-0 focus-visible:ring-0"
          }
          placeholder={"Search Questions"}
          style={{
            maxHeight: "200px",
            height: "24px"
          }}
          onChange={(event) => {
            const target = event.target as HTMLTextAreaElement;
            target.style.height = "24px";
            target.style.height = target.scrollHeight + "px";
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && event.ctrlKey) {
              event.preventDefault();
              event.stopPropagation();
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              event.target?.form.requestSubmit();
            }
          }}
        />
        <button
          type={"submit"}
          className={
            "absolute bottom-3 right-3 flex items-center rounded-md bg-zinc-200 p-1.5 text-sm shadow-md hover:bg-zinc-400"
          }
        >
          <BiSend className={"text-zinc-900"} />
        </button>
      </form>
      {querySearchState.query !== "" && (
        <button
          className={
            "group flex w-fit items-center gap-2 rounded-md border border-zinc-300 px-2 py-1 text-sm hover:bg-zinc-800"
          }
          onClick={() => {
            setQuerySearchState(DEFAULT_QUERY_SEARCH_STATE);
          }}
        >
          <p className={"h-fit align-middle"}>{querySearchState.query}</p>
          <span className={"rounded-full bg-zinc-300 text-zinc-900 "}>
            <HiX />
          </span>
        </button>
      )}
      <div className={"grid grid-cols-1 items-center gap-4 duration-150 sm:grid-cols-2 md:gap-2"}>
        <CustomPagingInfo
          currentPage={querySearchState.page.current}
          pageSize={querySearchState.page.size}
          totalItems={questions?.meta.page.total_results}
          isLoading={isLoading}
        />

        <div className={"flex flex-row flex-wrap items-center gap-3 duration-150 sm:justify-end"}>
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

      {isLoading && <div>Loading...</div>}
      {!isLoading && questions && (
        <>
          <div className={"mt-2 grid gap-4"}>
            {questions.results.map((question: { id: { raw: string }; question: string }) => (
              <QuestionCard result={question} key={question.id.raw} editable />
            ))}
          </div>
          <CustomPagination
            currentPage={questions?.meta.page.current}
            totalPages={questions?.meta.page.total_pages}
            updatePage={updatePage}
          />
        </>
      )}
      {/*<div
        className={
          "relative hidden w-fit rounded-md bg-zinc-900 px-2 py-1.5 pr-10 text-xs ring-2 ring-zinc-600 duration-150 hover:bg-zinc-800 md:text-sm"
        }
      >
        <span className="block truncate capitalize">None</span>
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center">
          <HiChevronDown size={20} className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </span>
      </div>
      <div className={"hidden w-fit bg-zinc-900"}>
        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
          <a
            href="#"
            className={classNames(
              "relative inline-flex items-center rounded-l-md px-2 py-2 ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0",
              questions?.meta?.page.current === 1
                ? "pointer-events-none text-zinc-400"
                : "text-zinc-200 hover:bg-zinc-800"
            )}
            {...(questions?.meta?.page.current === 1 && { "aria-disabled": "true" })}
            onClick={(event) => {
              event.preventDefault();
              if (questions?.meta?.page.current !== 1) {
                updatePage(questions?.meta?.page.current - 1);
              }
            }}
          >
            <span className="sr-only">Previous</span>
            <HiChevronLeft className="h-5 w-5" aria-hidden="true" />
          </a>
          {[1, 2, 3].map((pageNumber, index) => {
            return (
              <a
                href={"#"}
                key={index}
                className={classNames(
                  "z-10 inline-flex w-fit items-center px-3 py-2 text-sm focus:z-20",
                  1 === questions?.meta?.page.current
                    ? "bg-zinc-100 font-semibold text-zinc-900"
                    : "font-semibold text-zinc-200 ring-1 ring-inset ring-gray-300 hover:bg-zinc-800 focus:outline-offset-0"
                )}
                onClick={(event) => {
                  event.preventDefault();
                  if (typeof 1 === "number") {
                    updatePage(1);
                  }
                }}
              >
                {Number(1) < 10 ? `0${1}` : 11}
              </a>
            );
          })}
          <a
            href="#"
            className={classNames(
              "relative inline-flex items-center rounded-r-md px-2 py-2 ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0",
              questions?.meta?.page.current === questions?.meta?.page.total_pages
                ? "pointer-events-none text-zinc-400"
                : "text-zinc-200 hover:bg-zinc-800"
            )}
            {...(questions?.meta?.page.current === questions?.meta?.page.current && { "aria-disabled": "true" })}
            onClick={(event) => {
              event.preventDefault();
              if (questions?.meta?.page.current !== questions?.meta?.page.total_pages) {
                updatePage(questions?.meta?.page.current + 1);
              }
            }}
          >
            <span className="sr-only">Next</span>
            <HiChevronRight className="h-5 w-5" aria-hidden="true" />
          </a>
        </nav>
      </div>*/}
    </>
  );
};

export default SearchAndResults;
