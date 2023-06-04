"use client";

import { useState } from "react";

import axios from "axios";
import { useForm } from "react-hook-form";

export default function CreateQuestion() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const methods = useForm();
  const { register, handleSubmit, reset } = methods;

  const onSubmit = async (question: Record<string, string>) => {
    setSubmitting(true);

    const questionData = {
      question: question.question,
      answer: question.answer.split("-*-"),
      question_type: question.question_type,
      language: question.language,
      tags: question.tags.split(",").map((tag) => tag.trim())
    };

    try {
      await axios({
        method: "POST",
        url: "/api/create",
        data: questionData
      });

      setSubmitting(false);
      setSuccess(true);
      reset();
    } catch (err) {
      console.error(`Error inserting document into Elasticsearch: ${err}`);
      setSubmitting(false);
    }
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
                <label htmlFor="question" className={"text-sm font-medium xl:text-base"}>
                  Question
                </label>
                <input
                  type="text"
                  className={
                    "mt-1 block w-full rounded-md border-transparent bg-zinc-800 p-2 text-base tracking-normal duration-150  focus:ring-0 md:text-lg"
                  }
                  id="question"
                  required
                  {...register("question")}
                />
              </div>

              <div className={"grid grid-cols-1 gap-0.5"}>
                <label htmlFor="answer" className={"text-sm font-medium xl:text-base"}>
                  Answer
                </label>
                <textarea
                  id="answer"
                  className={
                    "mt-1 block w-full rounded-md border-transparent bg-zinc-800 p-2 text-base tracking-normal duration-150  focus:ring-0 md:text-lg"
                  }
                  required
                  {...register("answer")}
                />
              </div>

              <div className={"grid grid-cols-1 gap-0.5"}>
                <label htmlFor="question_type" className={"text-sm font-medium xl:text-base"}>
                  Question Type
                </label>
                <select
                  id="question_type"
                  className={
                    "mt-1 block w-full rounded-md border-transparent bg-zinc-800 p-2 text-base tracking-normal duration-150  focus:ring-0 md:text-lg"
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
                <label htmlFor="language" className={"text-sm font-medium xl:text-base"}>
                  Language
                </label>
                <select
                  id="language"
                  className={
                    "mt-1 block w-full rounded-md border-transparent bg-zinc-800 p-2 text-base tracking-normal duration-150  focus:ring-0 md:text-lg"
                  }
                  required
                  {...register("language")}
                >
                  <option value="react">React</option>
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="algorithms">Algorithm</option>
                </select>
              </div>

              <div className={"grid grid-cols-1 gap-0.5"}>
                <label htmlFor="tags" className={"text-sm font-medium xl:text-base"}>
                  Tags
                </label>
                <input
                  type="text"
                  className={
                    "mt-1 block w-full rounded-md border-transparent bg-zinc-800 p-2 text-base tracking-normal duration-150 focus:ring-0 md:text-lg"
                  }
                  id="tags"
                  {...register("tags")}
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={submitting}
                  className={
                    "rounded bg-zinc-50 px-4 py-1.5 text-base font-semibold text-zinc-800 duration-150 hover:bg-zinc-900 hover:text-zinc-50 hover:ring-2 hover:ring-zinc-50 focus:outline-none focus:ring-offset-1"
                  }
                >
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {success && <p>Question submitted successfully!</p>}
      </div>
    </div>
  );
}
