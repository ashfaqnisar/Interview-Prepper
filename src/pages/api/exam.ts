import { Client } from "@elastic/enterprise-search";
import { NextApiRequest, NextApiResponse } from "next";

const client = new Client({
  url: process.env.ELASTIC_APP_SEARCH_ENDPOINT as string,
  auth: {
    token: process.env.ELASTIC_PRIVATE_KEY as string
  }
});

// Create a next js request which takes in a post request and creates a question in elastic search
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const { domains } = req.body;

      const querySearch = {
        query: "",
        ...(domains &&
          domains.length > 0 && {
            filters: {
              domain: domains
            }
          }),
        page: {
          size: 20
        },
        result_fields: {
          id: { raw: {} },
          question: { raw: {} },
          answer: { raw: {} },
          domain: { raw: {} }
        }
      };

      console.log(querySearch);

      const response = await client.app.search({
        engine_name: process.env.ELASTIC_ENGINE_NAME as string,
        body: querySearch
      });

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (response.errors) {
        return res.status(500).json({ message: "Error getting documents from database. " });
      }

      return res.status(200).json(response.results);
    } catch (err) {
      console.error(`Error inserting documents: ${err}`);
      res.status(500).json({ message: "Error inserting documents into database." });
    }
  } else {
    res.status(405).json({ message: "Method not allowed." });
  }
}
