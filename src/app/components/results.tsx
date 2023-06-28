import * as React from "react";
import { memo } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { SearchState } from "@/types/search";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/shared/ui/card";
import CustomMarkdown from "@/shared/CustomMarkdown";

interface QuestionAnswerWithRaw {
  id: { raw: string };
  question: { raw: string };
  answer: { raw: string[] };
  domain: { raw: string };
  question_type?: { raw: string };
  tags?: { raw: string[] };
}

const QuestionCard = ({ data }: { data: QuestionAnswerWithRaw }) => {
  return (
    <Card className={"border-primary"}>
      <CardHeader className={"p-4 pb-2"}>
        <Badge className={"mb-3 w-fit capitalize"} variant={"outline"}>
          {data.domain.raw}
        </Badge>
        <CardTitle className={"text-base 2xl:text-lg"}>
          {"->"} {data.question.raw}
        </CardTitle>
      </CardHeader>
      <CardContent className={"p-4 pt-0"}>
        <div className={"grid grid-cols-1 gap-2"}>
          {data?.answer?.raw.map((answer: string, index: number) => (
            <CustomMarkdown key={index} value={answer} />
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>Deploy</Button>
      </CardFooter>
    </Card>
  );
};

const Results = memo(({ queryState }: { queryState: SearchState }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["questions", queryState],
    queryFn: async ({ signal }) => {
      const res = await axios({
        method: "POST",
        url: `${process.env.NEXT_PUBLIC_APP_SEARCH_ENDPOINT}/api/as/v1/engines/${process.env.NEXT_PUBLIC_ENGINE_NAME}/search`,
        data: {
          ...queryState,
          ...(queryState.sort && queryState?.sort?.field !== "relevance"
            ? {
                sort: { [queryState.sort.field]: queryState.sort.order },
              }
            : { sort: undefined }),
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
    </div>
  );
});

Results.displayName = "Results";

export default Results;
