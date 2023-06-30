import * as React from "react";
import { memo, useCallback, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ChevronsLeft, ChevronsRight } from "lucide-react";

import { SearchState } from "@/types/search";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/shared/ui/card";
import { Textarea } from "@/shared/ui/textarea";
import CustomMarkdown from "@/shared/CustomMarkdown";
import { Icons } from "@/shared/icons";

interface QuestionAnswerWithRaw {
  id: { raw: string };
  question: { raw: string };
  answer: { raw: string[] };
  domain: { raw: string };
  question_type?: { raw: string };
  tags?: { raw: string[] };
}

const QuestionCard = memo(({ data }: { data: QuestionAnswerWithRaw }) => {
  const [isEditable, setIsEditable] = useState(false);
  const queryClient = useQueryClient();

  const [newAnswer, setNewAnswer] = useState("");

  const deleteQuestionMutation = useMutation({
    mutationFn: async () => {
      return axios({
        method: "POST",
        url: "/api/questions/delete",
        data: {
          id: data.id.raw,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["questions"]);
      queryClient.invalidateQueries(["domains"]);
    },
  });
  const updateQuestionMutation = useMutation({
    mutationFn: async () => {
      return axios({
        method: "PATCH",
        url: "/api/questions/update",
        data: {
          id: data.id.raw,
          answer: newAnswer.split("=*="),
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["questions"]);
      queryClient.invalidateQueries(["domains"]);
      isEditable && setIsEditable(false);
    },
  });

  const refreshQuestion = () => {
    queryClient.invalidateQueries(["questions"]);
    queryClient.invalidateQueries(["domains"]);
  };

  useEffect(() => {
    if (isEditable) {
      setNewAnswer(data.answer.raw.join("=*="));
    } else {
      setNewAnswer("");
    }
  }, [data.answer.raw, isEditable]);

  return (
    <Card className={"border-primary"}>
      <CardHeader className={"p-4 pb-2"}>
        <div className={"flex flex-wrap justify-between"}>
          <Badge className={"mb-3 w-fit capitalize"} variant={"outline"}>
            {data.domain.raw}
          </Badge>
          <div className={"flex gap-2"}>
            <Button
              variant={"outline"}
              className={"h-7 w-7"}
              size={"icon"}
              onClick={() => {
                setIsEditable(true);
              }}
            >
              <Icons.edit className={"h-3 w-3"} />
            </Button>{" "}
            <Button
              variant={"outline"}
              className={"h-7 w-7"}
              size={"icon"}
              onClick={refreshQuestion}
            >
              <Icons.refresh className={"h-3 w-3"} />
            </Button>{" "}
            <Button
              variant={"outline"}
              className={"h-7 w-7 hover:bg-destructive"}
              size={"icon"}
              onClick={() => deleteQuestionMutation.mutate()}
              disabled={deleteQuestionMutation.isLoading}
            >
              <Icons.trash className={"h-3 w-3"} />
            </Button>
          </div>
        </div>
        <CardTitle className={"text-base 2xl:text-lg"}>
          {"->"} {data.question.raw}
        </CardTitle>
      </CardHeader>
      <CardContent className={"p-4 pt-0"}>
        {isEditable ? (
          <div className={"flex flex-col flex-wrap gap-2"}>
            <Textarea
              defaultValue={""}
              className={"w-full rounded px-3 py-2 text-base 2xl:text-lg"}
              value={newAnswer}
              disabled={updateQuestionMutation.isLoading}
              onChange={(event) => {
                const target = event.target;
                target.style.height = "22.5px";
                target.style.height = target.scrollHeight + "px";
                setNewAnswer(event.target.value);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && event.ctrlKey) {
                  event.preventDefault();
                  event.stopPropagation();

                  updateQuestionMutation.mutate();
                }
              }}
              rows={11}
            />
            <p className={"mt-2 text-sm font-semibold text-muted-foreground"}>Preview: </p>
            <div className={"grid grid-cols-1 gap-2"}>
              {newAnswer.split("=*=").map((answer: string, index: number) => (
                <CustomMarkdown key={index} value={answer} />
              ))}
            </div>
            <CardFooter className="flex gap-2 px-0">
              <Button variant="outline" onClick={() => setIsEditable(false)}>
                Cancel
              </Button>
              <Button onClick={() => updateQuestionMutation.mutate()}>Update</Button>
            </CardFooter>
          </div>
        ) : (
          <div className={"grid grid-cols-1 gap-2"}>
            {data?.answer?.raw.map((answer: string, index: number) => (
              <CustomMarkdown key={index} value={answer} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
});
QuestionCard.displayName = "QuestionCard";

const Pagination = memo(
  ({
    totalPages,
    currentPage,
    updatePage,
  }: {
    totalPages: number;
    currentPage: number;
    updatePage: (newPage: number) => void;
  }) => {
    return (
      <div className={"flex flex-wrap items-center gap-2"}>
        <p className={"text-sm font-medium"}>
          Page {currentPage} of {totalPages}
        </p>
        <Button
          variant={"outline"}
          size={"icon"}
          disabled={currentPage === 1}
          onClick={() => {
            if (currentPage !== 1) updatePage(1);
          }}
        >
          <ChevronsLeft className={"h-3 w-3"} />
        </Button>
        <Button
          variant={"outline"}
          size={"icon"}
          disabled={currentPage === 1}
          onClick={() => {
            if (currentPage !== 1) updatePage(currentPage - 1);
          }}
        >
          <Icons.leftArrow className={"h-3 w-3"} />
        </Button>
        <Button
          variant={"outline"}
          size={"icon"}
          disabled={currentPage === totalPages}
          onClick={() => {
            if (currentPage !== totalPages) updatePage(currentPage + 1);
          }}
        >
          <Icons.rightArrow className={"h-3 w-3"} />
        </Button>
        <Button
          variant={"outline"}
          size={"icon"}
          disabled={currentPage === totalPages}
          onClick={() => {
            if (currentPage !== totalPages) updatePage(totalPages);
          }}
        >
          <ChevronsRight className={"h-3 w-3"} />
        </Button>
      </div>
    );
  }
);
Pagination.displayName = "Pagination";

const Results = memo(
  ({
    queryState,
    updatePage,
  }: {
    queryState: SearchState;
    updatePage: (newPage: number) => void;
  }) => {
    const { data, isLoading } = useQuery({
      queryKey: ["questions", queryState],
      queryFn: async ({ signal }) => {
        const res = await axios({
          method: "POST",
          // url: "/api/questions",
          url: `${process.env.NEXT_PUBLIC_APP_SEARCH_ENDPOINT}/api/as/v1/engines/${process.env.NEXT_PUBLIC_ENGINE_NAME}/search`,
          data: {
            ...queryState,
            ...(queryState.sort && queryState?.sort?.field !== "relevance"
              ? {
                  sort: { [queryState.sort.field]: queryState.sort.order },
                }
              : {
                  sort: undefined,
                }),
          },
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_APP_SEARCH_KEY}`,
          },
          signal,
        });
        return res.data;
      },
      keepPreviousData: true,
      staleTime: 20 * 1000,
      initialDataUpdatedAt: Date.now(),
    });

    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (!data?.results.length) {
      return <div>No results found.</div>;
    }

    return (
      <div className={"grid grid-cols-1 gap-3"}>
        {data?.results.map((item: QuestionAnswerWithRaw) => (
          <QuestionCard key={item.id.raw} data={item} />
        ))}
        <Pagination
          totalPages={data.meta.page.total_pages}
          currentPage={data.meta.page.current}
          updatePage={updatePage}
        />
      </div>
    );
  }
);

Results.displayName = "Results";

export default Results;
