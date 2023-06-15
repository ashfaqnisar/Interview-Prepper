import fs from "fs";
import path from "path";

import { Client } from "@elastic/enterprise-search";
import { NextApiRequest, NextApiResponse } from "next";

const client = new Client({
  url: process.env.ELASTIC_APP_SEARCH_ENDPOINT as string,
  auth: {
    token: process.env.ELASTIC_PRIVATE_KEY as string
  }
});

function transformData<T extends Record<string, any>>(data: T[]): T[] {
  return data.map((item) => {
    const transformedItem: T = {} as T;

    for (const key in item) {
      if (Object.hasOwnProperty.call(item, key) && key !== "_meta") {
        const rawValue = item[key]?.raw;
        transformedItem[key] = rawValue !== undefined ? rawValue : item[key];
      }
    }

    return transformedItem;
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const { query = "", language } = req.body;
      const pageSize = 1000;

      const backupPath = path.join(process.cwd(), "data", "backup", new Date().toISOString().replace(/:/g, ""));

      fs.mkdirSync(backupPath, { recursive: true }); // Create the folder

      const fetchAndWriteDocuments = async (page: number) => {
        const response = await client.app.search({
          engine_name: process.env.ELASTIC_ENGINE_NAME as string,
          body: {
            query,
            page: { size: pageSize, current: page },
            ...(language && {
              filters: {
                language: [language]
              }
            })
          }
        });
        const jsonFileName = `${backupPath}/doc_${page}.json`;
        fs.writeFileSync(jsonFileName, JSON.stringify(transformData(response.results)));
      };

      const docs = await client.app.search({
        engine_name: process.env.ELASTIC_ENGINE_NAME as string,
        body: {
          query,
          page: {
            size: pageSize
          },
          ...(language && {
            filters: {
              language: [language]
            }
          })
        }
      });
      fs.writeFileSync(`${backupPath}/doc_1.json`, JSON.stringify(transformData(docs.results)));

      await Promise.all(
        Array.from(
          { length: docs.meta.page.total_pages - 1 },
          async (_, index) => await fetchAndWriteDocuments(index + 2)
        )
      );

      return res.status(200).send("Done.");
    } catch (err) {
      console.error(`Error processing the documents: ${err}`);
      return res.status(500).send({ message: "Error processing the documents" });
    }
  }

  return res.status(400).send({ message: "Bad Request" });
}
