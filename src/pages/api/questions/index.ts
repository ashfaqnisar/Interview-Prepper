import { NextApiRequest, NextApiResponse } from "next";
import { SearchRequest, SearchResponse } from "@elastic/enterprise-search/lib/api/app/types";

import { SearchState } from "@/types/search";
import { elasticClient } from "@/utils/api";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Record<"message", string> | SearchResponse>
) {
  if (req.method === "POST") {
    try {
      const { query = "", filters, page = { size: 25, current: 1 }, sort }: SearchState = req.body;

      const searchQuery = {
        query,
        page,
        ...(sort && {
          sort,
        }),
        ...(filters && {
          filters,
        }),
      };

      const responses = await elasticClient.app.search({
        engine_name: process.env.ELASTIC_ENGINE_NAME as string,
        body: searchQuery as SearchRequest["body"],
      });
      return res.status(200).json(responses);
    } catch (err) {
      console.error(`Error: ${err}`);
      res.status(500).json({ message: "Unable to fetch the documents." });
    }
  }
  return res.status(405).json({ message: "Method not allowed." });
}
