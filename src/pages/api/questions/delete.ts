import * as process from "process";
import { NextApiRequest, NextApiResponse } from "next";
import { ListDocumentsResponse } from "@elastic/enterprise-search/lib/api/app/types";

import { elasticClient, splitToChunks } from "@/utils/api";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Record<"message", string>>
) {
  if (req.method === "POST") {
    const { id } = req.body;
    if (id) {
      try {
        // Delete the document from the index using the id.
        await elasticClient.app.deleteDocuments({
          engine_name: process.env.ELASTIC_ENGINE_NAME as string,
          documentIds: [id],
        });

        // Wait for the document to be deleted.
        await new Promise((resolve) => setTimeout(resolve, 500));

        return res.status(200).send({ message: "Successfully deleted the question." });
      } catch (err) {
        console.error(`Error: ${err}`);
        return res.status(500).send({ message: "Unable to delete the question." });
      }
    } else if (process.env.NODE_ENV !== "production") {
      try {
        let { domain } = req.body;
        if (domain) {
          domain = domain.toLowerCase();
        }

        const searchQuery = {
          query: "",
          page: {
            size: 1000,
          },
          result_fields: {
            id: {
              raw: {},
            },
          },
          ...(domain && {
            filters: {
              domain: [domain],
            },
          }),
        };

        let totalCount = 0;

        const initialResponse: ListDocumentsResponse = await elasticClient.app.search({
          engine_name: process.env.ELASTIC_ENGINE_NAME as string,
          body: {
            ...searchQuery,
            page: { size: 1 },
          },
        });
        totalCount = initialResponse.meta.page.total_results;

        while (totalCount > 0) {
          const response: ListDocumentsResponse = await elasticClient.app.search({
            engine_name: process.env.ELASTIC_ENGINE_NAME as string,
            body: searchQuery,
          });

          const idsToBeDeleted = response.results.map((result: { id?: { raw?: string } }) => {
            return result.id?.raw as string;
          });

          if (idsToBeDeleted.length > 0) {
            console.log(`Deleting ${idsToBeDeleted.length} documents...`);
            await Promise.all(
              splitToChunks(idsToBeDeleted, 100).map(async (idGroup) => {
                return elasticClient.app.deleteDocuments({
                  engine_name: process.env.ELASTIC_ENGINE_NAME as string,
                  documentIds: idGroup,
                });
              })
            );
          }

          totalCount -= idsToBeDeleted.length;
        }

        return res.status(200).send({ message: "Successfully deleted all the questions." });
      } catch (err) {
        console.error(`Error: ${err}`);
        return res.status(500).send({ message: "Unable to delete the questions." });
      }
    }
  }
  return res.status(400).send({ message: "Bad Request" });
}
