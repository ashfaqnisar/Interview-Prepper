"use client";

import { Fragment } from "react";
import * as React from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/shared/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";
import CustomMarkdown from "@/shared/CustomMarkdown";

const CreatePage = () => {
  const queryClient = useQueryClient();

  const formMethods = useForm({
    defaultValues: {
      question: "",
      answer: "",
      question_type: "definition",
      domain: "",
      otherLanguage: "",
      tags: "",
    },
  });
  const { register, watch, handleSubmit, reset } = formMethods;

  const { data: domains } = useQuery<{ value: string; count: number }[]>({
    queryKey: ["domains"],
    queryFn: async ({ signal }) => {
      const res = await axios({
        method: "POST",
        url: `${process.env.NEXT_PUBLIC_APP_SEARCH_ENDPOINT}/api/as/v1/engines/${process.env.NEXT_PUBLIC_ENGINE_NAME}/search`,
        data: {
          query: "",
          facets: {
            domain: [
              {
                type: "value",
                sort: {
                  count: "desc",
                },
              },
            ],
          },
          page: {
            size: 0,
          },
        },
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_APP_SEARCH_KEY}`,
        },
        signal,
      });
      return res.data.facets.domain[0].data;
    },
    keepPreviousData: true,
    staleTime: 20 * 1000,
    initialDataUpdatedAt: Date.now(),
  });

  const mutation = useMutation({
    mutationFn: (newQuestion: Record<string, string | string[]>) => {
      return axios({
        method: "POST",
        url: "/api/questions/create",
        data: newQuestion,
      });
    },
    onSuccess: async (data, variables) => {
      queryClient.setQueryData<Array<{ value: string; count: number }>>(["domains"], (oldData) => {
        const { domain } = variables;

        if (oldData) {
          const foundTechnology = oldData.find((item) => item.value === domain);
          if (foundTechnology) {
            foundTechnology.count++;
          } else {
            oldData.push({ value: domain as string, count: 1 });
          }
          return oldData;
        }
        return [{ value: domain as string, count: 1 }];
      });
      reset();
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const onSubmit = (question: Record<string, string>) => {
    const questionData = {
      question_type: question.question_type,
      domain:
        question.otherLanguage.trim() !== "" ? question.otherLanguage.trim() : question.domain,
      question: question.question.trim(),
      answer: question.answer.trim().split("=*="),
      tags: question.tags.split(",").map((tag) => tag.trim()),
    };

    mutation.mutate(questionData);
  };
  return (
    <div>
      <section className="container grid items-center gap-6 pb-8 pt-6 md:pb-10">
        <div className="flex flex-col items-start gap-2">
          <h2 className={"text-2xl font-bold"}>Create</h2>
          <div className={"grid w-full grid-cols-1 gap-2 lg:grid-cols-2"}>
            <div>
              <h5 className={"mb-2 text-base font-semibold"}>New Question</h5>
              <Form {...formMethods}>
                <form onSubmit={handleSubmit(onSubmit)} className={"grid grid-cols-1 gap-4"}>
                  <div className={"grid grid-cols-1 gap-1.5"}>
                    <Label htmlFor="question">Question</Label>
                    <Textarea
                      className={"text-sm md:text-base"}
                      id="question"
                      placeholder={"Ex: What is a variable?"}
                      required
                      {...register("question", { required: true })}
                    />
                  </div>

                  <div className={"grid grid-cols-1 gap-1.5"}>
                    <Label htmlFor="answer">Answer</Label>
                    <Textarea
                      id="answer"
                      placeholder={"Ex: A variable is a container for a value."}
                      className={"text-sm md:text-base"}
                      required
                      {...register("answer", { required: true })}
                    />
                  </div>

                  <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-2">
                    <FormField
                      control={formMethods.control}
                      name="question_type"
                      render={({ field }) => (
                        <FormItem className={"space-y-1"}>
                          <FormLabel>Question Type</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a verified email to display" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="definition">Definition</SelectItem>
                              <SelectItem value="concept">Concept</SelectItem>
                              <SelectItem value="code">Code</SelectItem>
                              <SelectItem value="comparison">Comparison</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={formMethods.control}
                      name="domain"
                      render={({ field }) => (
                        <FormItem className={"space-y-1"}>
                          <FormLabel>Domain</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select A Domain" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {domains &&
                                domains.length > 0 &&
                                domains.map((domain) => (
                                  <SelectItem
                                    className={"capitalize"}
                                    key={domain.value}
                                    value={domain.value}
                                  >
                                    {domain.value}
                                  </SelectItem>
                                ))}
                              <SelectItem value="">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          {field.value === "" && (
                            <Input
                              className={"text-sm md:text-base"}
                              placeholder={"Ex: Python"}
                              required
                              {...register("otherLanguage")}
                            />
                          )}
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className={"grid grid-cols-1 gap-1.5"}>
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      type="text"
                      className={"text-sm md:text-base"}
                      placeholder={"Ex: Python, Variables"}
                      id="tags"
                      {...register("tags")}
                    />
                  </div>

                  <Button type="submit" className={"w-fit"} disabled={mutation.isLoading}>
                    <Plus className={"mr-1 h-5 w-5"} />
                    <p>{mutation.isLoading ? "Adding..." : "Submit"}</p>
                  </Button>
                </form>
              </Form>
              <div className={"font-medium"}>
                {mutation.isError && (
                  <p className="text-red-500">An error occurred while submitting the question.</p>
                )}
                {mutation.isSuccess && (
                  <p className="text-green-500">Question submitted successfully!</p>
                )}
              </div>
            </div>

            <div className={"xl:px-3"}>
              <h5 className={"mb-2 text-base font-semibold"}>Preview</h5>
              <div className={"grid grid-cols-1 gap-2"}>
                <div>
                  <Label className={"underline"}>Question: </Label>
                  <div className={"grid grid-cols-1 gap-2"}>
                    {watch()
                      .question.trim()
                      .split("=*=")
                      .map((question: string, index: number) => (
                        <CustomMarkdown key={index} value={question} />
                      ))}
                  </div>
                </div>
                <div>
                  <Label className={"underline"}>Answer: </Label>
                  <div className={"grid grid-cols-1 gap-2"}>
                    {watch()
                      .answer.trim()
                      .split("=*=")
                      .map((answer: string, index: number) => (
                        <CustomMarkdown key={index} value={answer} />
                      ))}
                  </div>
                </div>
                <div>
                  <Label className={"underline"}>Tags: </Label>
                  <div className={"flex flex-row flex-wrap gap-2 "}>
                    {(watch().tags.trim().split(",") ?? []).map((tag: string, index: number) => (
                      <Fragment key={tag}>
                        <span className={"font text-sm capitalize 2xl:text-base"}>{tag}</span>
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
      </section>
    </div>
  );
};

export default CreatePage;
