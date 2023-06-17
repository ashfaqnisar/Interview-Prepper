"use client";

import { useState } from "react";

import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import classNames from "classnames";
import { AiFillThunderbolt } from "react-icons/ai";
import { ImSpinner2 } from "react-icons/im";

import CustomMarkdown from "@/shared/CustomMarkdown";
import { QuestionWithRaw } from "@/types";

const TechnologyFilterTags = ({
  technologyFilters,
  updateTechnologyFilters
}: {
  technologyFilters: string[];
  updateTechnologyFilters: (technologyFilters: string[]) => void;
}) => {
  const {
    data: technologies,
    isSuccess,
    isLoading
  } = useQuery<{ value: string; count: number }[]>({
    queryKey: ["technologies"],
    queryFn: async ({ signal }) => {
      const res = await axios({
        method: "POST",
        url: `${process.env.NEXT_PUBLIC_APP_SEARCH_ENDPOINT}/api/as/v1/engines/${process.env.NEXT_PUBLIC_ENGINE_NAME}/search`,
        data: {
          query: "",
          facets: {
            language: [
              {
                type: "value",
                sort: {
                  count: "desc"
                }
              }
            ]
          },
          page: {
            size: 0
          }
        },
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_APP_SEARCH_KEY}`
        },
        signal
      });
      return res.data.facets.language[0].data;
    },
    keepPreviousData: true,
    staleTime: 20 * 1000,
    initialDataUpdatedAt: Date.now()
  });

  if (isLoading) {
    return (
      <div className={"flex flex-wrap gap-2"}>
        {[1, 2, 3, 4]?.map((item) => {
          return (
            <div
              key={item}
              className={
                "animate-pulse rounded bg-neutral-400 px-6 py-1 text-xs font-medium text-neutral-400 ring-1 ring-neutral-900 duration-150 2xl:text-sm"
              }
            >
              <p>.</p>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    isSuccess && (
      <div className={"flex flex-wrap gap-2"}>
        <div
          className={classNames(
            "cursor-pointer rounded p-1 px-2 text-xs font-medium ring-1 duration-150 2xl:text-sm",
            technologyFilters.length === 0
              ? "bg-neutral-100 text-neutral-900 ring-neutral-900"
              : "text-zinc-50 ring-neutral-400"
          )}
          onClick={() => {
            updateTechnologyFilters([]);
          }}
        >
          <p className={"capitalize"}>All</p>
        </div>
        {technologies.map((technology: { value: string; count: number }) => (
          <div
            key={`${technology.value}`}
            className={classNames(
              "cursor-pointer rounded p-1 px-2 text-xs font-medium ring-1 duration-150 2xl:text-sm",
              technologyFilters.includes(technology.value)
                ? "bg-neutral-100 font-semibold text-neutral-900 ring-neutral-900"
                : "text-zinc-50 ring-neutral-400"
            )}
            onClick={() => {
              if (technologyFilters.includes(technology.value)) {
                updateTechnologyFilters(technologyFilters.filter((t) => t !== technology.value));
              } else {
                updateTechnologyFilters([...technologyFilters, technology.value]);
              }
            }}
          >
            <p className={"capitalize"}>
              {technology.value} | {technology.count}
            </p>
          </div>
        ))}
      </div>
    )
  );
};

const Page = () => {
  const [technologyFilters, setTechnologyFilters] = useState<string[]>([]);

  const [isExamActive, setIsExamActive] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<QuestionWithRaw[]>([]);

  const mutation = useMutation({
    mutationFn: async () => {
      return axios({
        method: "POST",
        url: "/api/exam",
        ...(technologyFilters.length > 0 && {
          data: { technologies: technologyFilters }
        })
      });
    },
    onSuccess: ({ data }) => {
      setQuestions(data);
      setIsExamActive(true);
    }
  });

  return (
    <div className="mx-auto mt-8 flex max-w-4xl items-center justify-center sm:mt-24 sm:min-h-screen sm:px-0 sm:pb-8 md:flex-row">
      {/*<div className="mx-auto mt-24 flex max-w-4xl flex-grow flex-row items-center justify-center overflow-auto pb-8">*/}
      {isExamActive && questions.length > 0 ? (
        <div className={"flex w-full flex-col items-start justify-center gap-4"}>
          <p className={"text-gray-400"}>
            Question <span className={"font-semibold"}>{currentQuestionIndex + 1}</span> of{" "}
            <span className={"font-semibold"}>{questions.length}</span>
          </p>
          <div className={"flex flex-col gap-1"}>
            <h4 className={"text-lg font-medium"}>{`-> ${questions[currentQuestionIndex].question.raw}`}</h4>
            <details className={"flex flex-col gap-1"}>
              <summary className={"mt-2 cursor-pointer text-gray-400"}>Show Answer</summary>
              {questions[currentQuestionIndex]?.answer?.raw.length > 0 && (
                <div
                  className={
                    "prose mt-1 grid max-w-none grid-cols-1 gap-2 dark:prose-invert md:prose-base 2xl:prose-lg prose-p:m-0 prose-p:text-zinc-300 prose-code:font-mono prose-pre:my-2 prose-pre:p-0"
                  }
                >
                  {questions[currentQuestionIndex]?.answer?.raw.map((answer: string, index: number) => (
                    <CustomMarkdown key={answer + index} value={answer} />
                  ))}
                </div>
              )}
            </details>
          </div>
          {/*<button*/}
          {/*  className={"rounded px-3 py-1 text-xs ring-1 ring-zinc-400 duration-150 hover:bg-zinc-900 lg:text-sm"}*/}
          {/*  onClick={() => {*/}
          {/*    setIsExamActive(false);*/}
          {/*    setCurrentQuestionIndex(0);*/}
          {/*    setQuestions([]);*/}
          {/*  }}*/}
          {/*>*/}
          {/*  Answer*/}
          {/*</button>*/}
          <div className={"flex gap-2 text-xs lg:text-sm"}>
            <button
              className={
                "rounded px-3 py-1 ring-1 ring-zinc-400 duration-150 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
              }
              disabled={currentQuestionIndex === 0}
              onClick={() => {
                if (currentQuestionIndex !== 0) {
                  setCurrentQuestionIndex(currentQuestionIndex - 1);
                }
              }}
            >
              {"<-"}
            </button>
            <button
              className={
                "rounded px-3 py-1 ring-1 ring-zinc-400 duration-150 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
              }
              disabled={currentQuestionIndex === questions.length - 1}
              onClick={() => {
                if (currentQuestionIndex === questions.length - 1) {
                  setIsExamActive(false);
                  setCurrentQuestionIndex(0);
                } else setCurrentQuestionIndex(currentQuestionIndex + 1);
              }}
            >
              {"->"}
            </button>
          </div>
          <button
            className={"rounded px-3 py-1 text-xs ring-1 ring-zinc-400 duration-150 hover:bg-zinc-900 lg:text-sm"}
            onClick={() => {
              setIsExamActive(false);
              setCurrentQuestionIndex(0);
              setQuestions([]);
            }}
          >
            Stop
          </button>
        </div>
      ) : (
        <div className={"flex flex-col items-center gap-4"}>
          <h2
            className={
              "pt-4 text-center text-lg font-bold tracking-tight duration-150 sm:text-left sm:text-xl lg:text-2xl xl:text-3xl"
            }
          >
            Exam
          </h2>
          <TechnologyFilterTags
            technologyFilters={technologyFilters}
            updateTechnologyFilters={(filters) => {
              setTechnologyFilters(filters);
            }}
          />

          <button
            className={
              "mt-6 flex w-fit items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold uppercase text-zinc-200 ring-1 ring-zinc-400 duration-150 hover:bg-zinc-200 hover:text-zinc-900 hover:ring-0 2xl:text-sm"
            }
            onClick={() => {
              mutation.mutate();
            }}
          >
            {mutation.isLoading ? <ImSpinner2 className={"animate-spin"} /> : <AiFillThunderbolt />}
            <span>Start</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Page;
