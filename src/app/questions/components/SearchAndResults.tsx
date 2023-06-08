import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { MdSend } from "react-icons/md";

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
    query: "";
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
      <form
        className={"relative flex w-full flex-col rounded-md border border-gray-300 bg-zinc-900 py-3 pl-4 "}
        onSubmit={(event) => {
          event.preventDefault();
          const target = event.target as HTMLFormElement;
          const query = target["search-textarea"].value;
          setQuerySearchState({
            ...querySearchState,
            query
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
            "absolute bottom-2 right-2.5 flex items-center rounded-md bg-zinc-300 p-1.5 shadow-md hover:bg-zinc-400"
          }
        >
          <MdSend size={18} className={"text-zinc-900"} />
        </button>
      </form>
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
        <div className={"mt-2 grid gap-4"}>
          {questions.results.map((question: { id: { raw: string }; question: string }) => (
            <QuestionCard result={question} key={question.id.raw} editable />
          ))}
        </div>
      )}
      {!isLoading && <div>Total Pages: {questions?.meta.page.total_pages}</div>}
    </>
  );
};

export default SearchAndResults;
