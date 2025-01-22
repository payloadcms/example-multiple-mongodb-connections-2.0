import path from "path";

import { payloadCloud } from "@payloadcms/plugin-cloud";
import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { webpackBundler } from "@payloadcms/bundler-webpack";
import { slateEditor } from "@payloadcms/richtext-slate";
import { buildConfig } from "payload/config";

import Users from "./collections/Users";
import { secondaryDBPlugin } from "./secondaryDBPlugin";

export default buildConfig({
  admin: {
    user: Users.slug,
    bundler: webpackBundler(),
  },
  editor: slateEditor({}),
  collections: [
    Users,
    {
      slug: "first-db",
      fields: [
        {
          type: "text",
          name: "text",
        },
      ],
    },
    {
      slug: "second-db",
      fields: [
        {
          type: "text",
          name: "text",
        },
      ],
    },
  ],
  typescript: {
    outputFile: path.resolve(__dirname, "payload-types.ts"),
  },
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, "generated-schema.graphql"),
  },
  plugins: [
    payloadCloud(),
    secondaryDBPlugin({
      collections: ["second-db"],
      secondDBUrl: "mongodb://127.0.0.1/poc-multiple-dbs-second",
    }),
  ],
  db: mongooseAdapter({
    url: process.env.DATABASE_URI,
  }),
});
