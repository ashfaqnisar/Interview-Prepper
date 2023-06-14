"use client";

import { Fragment } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useForm } from "react-hook-form";
import { BiPlus } from "react-icons/bi";

import CustomMarkdown from "@/shared/CustomMarkdown";

export default function CreateQuestion() {
  const methods = useForm({
    defaultValues: {
      question: "",
      answer: "",
      question_type: "definition",
      language: "",
      otherLanguage: "",
      tags: ""
    }
  });
  const queryClient = useQueryClient();

  const { register, watch, handleSubmit, reset } = methods;

  const { data: technologies } = useQuery({
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

  const mutation = useMutation({
    mutationFn: (newQuestion: Record<string, string | string[]>) => {
      return axios({
        method: "POST",
        url: "/api/questions/create",
        data: newQuestion
      });
    },
    onSuccess: async (data, variables) => {
      queryClient.setQueryData<Array<{ value: string; count: number }>>(["technologies"], (oldData) => {
        const { language } = variables;

        if (oldData) {
          const foundTechnology = oldData.find((technology) => technology.value === language);
          if (foundTechnology) {
            foundTechnology.count++;
          } else {
            oldData.push({ value: language as string, count: 1 });
          }
          return oldData;
        }
        return [{ value: language as string, count: 1 }];
      });
      reset();
    },
    onError: (error) => {
      console.log(error);
    }
  });

  const onSubmit = (question: Record<string, string>) => {
    const questionData = {
      question_type: question.question_type,
      language: question.otherLanguage.trim() !== "" ? question.otherLanguage.trim() : question.language,
      question: question.question.trim(),
      answer: question.answer.trim().split("-*-"),
      tags: question.tags.split(",").map((tag) => tag.trim())
    };

    mutation.mutate(questionData);
  };

  return (
    <div className={"w-full px-4 pb-8 sm:pt-16"}>
      <div className={"md:container md:mx-auto"}>
        <div className={"flex justify-center"}>
          <div className={"w-full"}>
            <h1
              className={
                "py-4 text-center text-lg font-bold tracking-tight duration-150 sm:text-left sm:text-xl md:text-2xl"
              }
            >
              Create
            </h1>
            <div className={"grid grid-cols-1 gap-2 lg:grid-cols-2"}>
              <div>
                <h5 className={"mb-2 text-base font-semibold"}>New Question</h5>
                <form onSubmit={handleSubmit(onSubmit)} className={"grid grid-cols-1 gap-4"}>
                  <div className={"grid grid-cols-1 gap-0.5"}>
                    <label htmlFor="question" className={"text-sm font-medium text-gray-200 md:text-sm 2xl:text-base"}>
                      Question
                    </label>
                    <textarea
                      className={
                        "mt-1 w-full rounded-md bg-zinc-900 px-2 py-1.5 text-sm tracking-normal focus:outline-none focus:ring-1 focus:ring-zinc-300 md:text-base 2xl:px-3 2xl:py-2"
                      }
                      id="question"
                      placeholder={"Ex: What is a variable?"}
                      required
                      {...register("question", { required: true })}
                    />
                  </div>

                  <div className={"grid grid-cols-1 gap-0.5"}>
                    <label htmlFor="answer" className={"text-sm font-medium text-gray-200 md:text-sm 2xl:text-base"}>
                      Answer
                    </label>
                    <textarea
                      id="answer"
                      placeholder={"Ex: A variable is a container for a value."}
                      className={
                        "mt-1 w-full rounded-md bg-zinc-900 px-2 py-1.5 text-sm tracking-normal focus:outline-none focus:ring-1 focus:ring-zinc-300 md:text-base 2xl:px-3 2xl:py-2"
                      }
                      required
                      {...register("answer", { required: true })}
                    />
                  </div>

                  <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-2">
                    <div className={"grid grid-cols-1 gap-0.5"}>
                      <label
                        htmlFor="question_type"
                        className={"text-sm font-medium text-gray-200 md:text-sm 2xl:text-base"}
                      >
                        Question Type
                      </label>
                      <select
                        id="question_type"
                        className={
                          "mt-1 w-full rounded-md bg-zinc-900 px-2 py-1.5 text-sm tracking-normal focus:outline-none focus:ring-1 focus:ring-zinc-300 md:text-base 2xl:px-3 2xl:py-2"
                        }
                        required
                        {...register("question_type")}
                      >
                        <option value="definition">Definition</option>
                        <option value="concept">Concept</option>
                        <option value="code">Code</option>
                        <option value="comparison">Comparison</option>
                      </select>
                    </div>

                    <div className={"grid grid-cols-1 gap-0.5"}>
                      <label
                        htmlFor="language"
                        className={"text-sm font-medium text-gray-200 md:text-sm 2xl:text-base"}
                      >
                        Language
                      </label>
                      <select
                        id="language"
                        className={
                          "mt-1 w-full rounded-md bg-zinc-900 px-2 py-1.5 text-sm capitalize tracking-normal focus:outline-none focus:ring-1 focus:ring-zinc-300 md:text-base 2xl:px-3 2xl:py-2"
                        }
                        {...(watch().language === "" && watch().otherLanguage.trim() === "" && { required: true })}
                        {...register("language")}
                      >
                        {technologies &&
                          technologies.map((technology: { value: string; count: number }) => {
                            return (
                              <option className="capitalize" key={technology.value} value={technology.value}>
                                {technology.value}
                              </option>
                            );
                          })}
                        <option value="">Other</option>
                      </select>
                      {watch().language === "" && (
                        <div className={"mt-2"}>
                          <input
                            className={
                              "mt-1 w-full rounded-md bg-zinc-900 px-2 py-1.5 text-sm tracking-normal focus:outline-none focus:ring-1 focus:ring-zinc-300 md:text-base 2xl:px-3 2xl:py-2"
                            }
                            placeholder={"Ex: Python"}
                            required
                            {...register("otherLanguage")}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={"grid grid-cols-1 gap-0.5"}>
                    <label htmlFor="tags" className={"text-sm font-medium text-gray-200 md:text-sm 2xl:text-base"}>
                      Tags
                    </label>
                    <input
                      type="text"
                      className={
                        "mt-1 w-full rounded-md bg-zinc-900 px-2 py-1.5 text-sm tracking-normal focus:outline-none focus:ring-1 focus:ring-zinc-300 md:text-base 2xl:px-3 2xl:py-2"
                      }
                      placeholder={"Ex: Python, Variables"}
                      id="tags"
                      {...register("tags")}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={mutation.isLoading}
                    className={
                      "flex w-fit items-center space-x-1 " +
                      "rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-300 duration-150 " +
                      "hover:bg-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-300 md:text-sm "
                    }
                  >
                    <span className={"h-5 w-5 text-xs"}>
                      <BiPlus size={20} />
                    </span>
                    <p>{mutation.isLoading ? "Adding..." : "Submit"}</p>
                  </button>
                  <p className={"font-medium"}>
                    {mutation.isError && (
                      <p className="text-red-500">An error occurred while submitting the question.</p>
                    )}
                    {mutation.isSuccess && <p className="text-green-500">Question submitted successfully!</p>}
                  </p>
                </form>
              </div>
              <div className={"xl:px-3"}>
                <h5 className={"mb-2 text-base font-semibold"}>Preview</h5>
                <div className={"grid grid-cols-1 gap-2"}>
                  <div>
                    <p className={"text-sm font-medium text-gray-200 underline md:text-sm 2xl:text-base"}>Question: </p>
                    <div
                      className={
                        "prose prose-invert grid max-w-none grid-cols-1 gap-2 md:prose-base 2xl:prose-lg prose-p:m-0 prose-p:text-zinc-300 prose-code:font-mono prose-pre:my-2 prose-pre:p-0"
                      }
                    >
                      {watch()
                        .question.trim()
                        .split("=*=")
                        .map((question: string, index: number) => (
                          <CustomMarkdown key={watch()?.question + index} value={question} />
                        ))}
                    </div>
                  </div>
                  <div>
                    <p className={"mb-1 text-sm font-medium text-gray-200 underline md:text-sm 2xl:text-base"}>
                      Answer:{" "}
                    </p>
                    <div
                      className={
                        "prose prose-invert grid max-w-none grid-cols-1 gap-2 md:prose-base 2xl:prose-lg prose-p:m-0 prose-p:text-zinc-300 prose-code:font-mono prose-pre:my-2 prose-pre:p-0"
                      }
                    >
                      {watch()
                        .answer.trim()
                        .split("=*=")
                        .map((answer: string, index: number) => (
                          <CustomMarkdown key={watch()?.answer + index} value={answer} />
                        ))}
                    </div>
                  </div>
                  <div>
                    <p className={"mb-1 text-sm font-medium text-gray-200 underline md:text-sm 2xl:text-base"}>
                      Tags:{" "}
                    </p>
                    <div className={"flex flex-row flex-wrap gap-2 "}>
                      {(watch().tags.trim().split(",") ?? []).map((tag: string, index: number) => (
                        <Fragment key={tag}>
                          <span className={"font text-sm capitalize text-zinc-300 2xl:text-base"}>{tag}</span>
                          {index !== (watch().tags.trim().split(",").length - 1 ?? 0) && (
                            <span className={" text-xs font-medium 2xl:text-sm"}>|</span>
                          )}
                        </Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
