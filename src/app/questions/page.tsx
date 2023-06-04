"use client";

import { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import classNames from "classnames";

import QuestionCard from "@/app/questions/components/QuestionCard";

const Page = () => {
  const [languageFilter, setLanguageFilter] = useState("");
  const { data: technologies } = useQuery({
    queryKey: ["languages"],
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
      return res.data;
    },
    keepPreviousData: true,
    staleTime: 20 * 1000,
    initialDataUpdatedAt: Date.now()
  });

  const { data: questions, status: questionStatus } = useQuery({
    queryKey: ["questions", languageFilter],
    queryFn: async ({ signal }) => {
      const res = await axios({
        method: "POST",
        url: `${process.env.NEXT_PUBLIC_APP_SEARCH_ENDPOINT}/api/as/v1/engines/${process.env.NEXT_PUBLIC_ENGINE_NAME}/search`,
        data: {
          query: "",
          ...(languageFilter && {
            filters: {
              language: [languageFilter]
            }
          })
        },
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_APP_SEARCH_KEY}`
        },
        signal
      });
      return res.data;
    }
  });

  return (
    <div className={"w-full px-4 pb-8 sm:pt-16"}>
      <div className={"md:container md:mx-auto"}>
        <div className={"flex justify-center py-2"}>
          <div className={"grid w-full max-w-4xl gap-4"}>
            <h1
              className={
                "pt-4 text-center text-lg font-bold tracking-tight duration-150 sm:text-left sm:text-xl md:text-2xl"
              }
            >
              Questions
            </h1>
            {technologies && (
              <div className={"flex gap-2"}>
                <div
                  className={classNames(
                    "cursor-pointer rounded p-1 px-2 text-xs font-medium ring-1 duration-150 2xl:text-sm",
                    languageFilter === ""
                      ? "bg-neutral-100 text-neutral-900 ring-neutral-900"
                      : "text-zinc-50 ring-neutral-400"
                  )}
                  onClick={() => {
                    setLanguageFilter("");
                  }}
                >
                  <p className={"capitalize"}>All</p>
                </div>
                {(technologies?.facets?.language[0].data).map((technology: { value: string; count: number }) => (
                  <div
                    key={`${technology.value}`}
                    className={classNames(
                      "cursor-pointer rounded p-1 px-2 text-xs font-medium ring-1 duration-150 2xl:text-sm",
                      technology.value === languageFilter
                        ? "bg-neutral-100 text-neutral-900 ring-neutral-900"
                        : "text-zinc-50 ring-neutral-400"
                    )}
                    onClick={() => {
                      setLanguageFilter(technology.value);
                    }}
                  >
                    <p className={"capitalize"}>
                      {technology.value} | {technology.count}
                    </p>
                  </div>
                ))}
              </div>
            )}
            {questions && (
              <div className={"grid gap-4"}>
                {questions.results.map((question: { id: { raw: string }; question: string }) => (
                  <QuestionCard result={question} key={question.id.raw} editable />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
