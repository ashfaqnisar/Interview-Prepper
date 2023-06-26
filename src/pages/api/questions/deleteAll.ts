import { Client } from "@elastic/enterprise-search";
import { ListDocumentsResponse } from "@elastic/enterprise-search/lib/api/app/types";
import { NextApiRequest, NextApiResponse } from "next";

const client = new Client({
  url: process.env.ELASTIC_APP_SEARCH_ENDPOINT as string,
  auth: {
    token: process.env.ELASTIC_PRIVATE_KEY as string
  }
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const { domain } = req.body;

      const { results }: ListDocumentsResponse = await client.app.search({
        engine_name: process.env.ELASTIC_ENGINE_NAME as string,
        body: {
          query: "",
          page: {
            size: 1000
          },
          result_fields: {
            id: {
              raw: {}
            }
          },
          ...(domain && {
            filters: {
              domain: [domain.toLowerCase()]
            }
          })
        }
      });

      // Only 100 documents can be deleted at a time.
      for (let i = 0; i < results.length; i += 100) {
        await client.app.deleteDocuments({
          engine_name: process.env.ELASTIC_ENGINE_NAME as string,
          documentIds: results.slice(i, i + 100).map((result: { id?: { raw?: string } }) => {
            return result.id?.raw as string;
          })
        });
      }

      // wait for 1 second to make sure the documents are deleted.
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return res.status(200).send("Successfully deleted all the documents.");
    } catch (err) {
      console.error(`Error processing the documents: ${err}`);
      return res.status(500).send({ message: "Error processing the documents" });
    }
  }
  return res.status(400).send({ message: "Bad Request" });
}
