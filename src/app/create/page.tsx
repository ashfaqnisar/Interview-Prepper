"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useForm } from "react-hook-form";
import { BiPlus } from "react-icons/bi";

export default function CreateQuestion() {
  const methods = useForm({
    defaultValues: {
      question: "",
      answer: "",
      question_type: "definition",
      language: "other",
      tags: ""
    }
  });
  const { register, handleSubmit, reset } = methods;

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
        url: "/api/create",
        data: newQuestion
      });
    },
    onSuccess: () => {
      reset();
    },
    onError: (error) => {
      console.log(error);
    }
  });

  const onSubmit = (question: Record<string, string>) => {
    const questionData = {
      ...question,
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
          <div className={"w-full max-w-4xl"}>
            <h1
              className={
                "py-4 text-center text-lg font-bold tracking-tight duration-150 sm:text-left sm:text-xl md:text-2xl"
              }
            >
              Create
            </h1>
            <form onSubmit={handleSubmit(onSubmit)} className={"grid grid-cols-1 gap-3"}>
              <div className={"grid grid-cols-1 gap-0.5"}>
                <label htmlFor="question" className={"text-sm font-medium md:text-sm 2xl:text-base"}>
                  Question
                </label>
                <textarea
                  className={
                    "mt-1 w-full rounded-md bg-zinc-900 px-2 py-1.5 text-sm tracking-normal focus:outline-none focus:ring-1 focus:ring-zinc-300 md:text-base 2xl:px-3 2xl:py-2"
                  }
                  id="question"
                  required
                  {...register("question", { required: true })}
                />
              </div>

              <div className={"grid grid-cols-1 gap-0.5"}>
                <label htmlFor="answer" className={"text-sm font-medium md:text-sm 2xl:text-base"}>
                  Answer
                </label>
                <textarea
                  id="answer"
                  className={
                    "mt-1 w-full rounded-md bg-zinc-900 px-2 py-1.5 text-sm tracking-normal focus:outline-none focus:ring-1 focus:ring-zinc-300 md:text-base 2xl:px-3 2xl:py-2"
                  }
                  required
                  {...register("answer", { required: true })}
                />
              </div>

              <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-2">
                <div className={"grid grid-cols-1 gap-0.5"}>
                  <label htmlFor="question_type" className={"text-sm font-medium md:text-sm 2xl:text-base"}>
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
                  <label htmlFor="language" className={"text-sm font-medium md:text-sm 2xl:text-base"}>
                    Language
                  </label>
                  <select
                    id="language"
                    className={
                      " mt-1 w-full rounded-md bg-zinc-900 px-2 py-1.5 text-sm capitalize tracking-normal focus:outline-none focus:ring-1 focus:ring-zinc-300 md:text-base 2xl:px-3 2xl:py-2"
                    }
                    required
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
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className={"grid grid-cols-1 gap-0.5"}>
                <label htmlFor="tags" className={"text-sm font-medium md:text-sm 2xl:text-base"}>
                  Tags
                </label>
                <input
                  type="text"
                  className={
                    "mt-1 w-full rounded-md bg-zinc-900 px-2 py-1.5 text-sm tracking-normal focus:outline-none focus:ring-1 focus:ring-zinc-300 md:text-base 2xl:px-3 2xl:py-2"
                  }
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
                {mutation.isError && <p className="text-red-500">An error occurred while submitting the question.</p>}
                {mutation.isSuccess && <p className="text-green-500">Question submitted successfully!</p>}
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
