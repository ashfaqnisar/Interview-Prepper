import { memo } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { SearchState } from "@/types/search";

interface QuestionAnswerWithRaw {
  id: { raw: string };
  question: { raw: string };
  answer: { raw: string };
}

const Results = memo(({ queryState }: { queryState: SearchState }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["questions", queryState],
    queryFn: async ({ signal }) => {
      const res = await axios({
        method: "POST",
        url: `${process.env.NEXT_PUBLIC_APP_SEARCH_ENDPOINT}/api/as/v1/engines/${process.env.NEXT_PUBLIC_ENGINE_NAME}/search`,
        data: {
          ...queryState,
          page: {
            size: parseInt(queryState.page.size),
          },
          ...(queryState?.sort?.field && queryState.sort.field !== "relevance"
            ? {
                sort: {
                  [queryState?.sort?.field]: queryState.sort.direction,
                },
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

  return (
    <div>
      {data?.results.map((item: QuestionAnswerWithRaw) => (
        <h2 key={item.id.raw} className={"font-medium"}>
          {item.question.raw}
        </h2>
      ))}
    </div>
  );
});

Results.displayName = "Results";

export default Results;
