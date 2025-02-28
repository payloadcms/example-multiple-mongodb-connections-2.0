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
    // this will come from the primary database
    {
      slug: "pages",
      fields: [
        {
          type: "text",
          name: "text",
        },
      ],
    },
    // this will come from the second database,
    // and its endpoints will be mounted as /api/second-db-pages
    // BUT it will source data from second db "pages" collection
    {
      slug: "second-db-pages",
      dbName: 'pages',
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
      collections: ["second-db-pages"],
      // secondDBUrl: process.env.DATABASE_URI_2,
      secondDBUrl: 'mongodb://127.0.0.1/database2',
    }),
  ],
  db: mongooseAdapter({
    url: process.env.DATABASE_URI,
    connectOptions: {
      // Set both of these to false
      // in order to not create collections on startup
      autoCreate: false,

      // Note that this will also disable the automatic creation of indexes
      // so if you use `index: true` in Payload on any fields, Payload will no longer
      // create indexes for you
      autoIndex: false,
    },
    schemaOptions: {
      // Set both of these to false
      // in order to not create collections on startup
      autoCreate: false,

      // Note that this will also disable the automatic creation of indexes
      // so if you use `index: true` in Payload on any fields, Payload will no longer
      // create indexes for you
      autoIndex: false,
    }
  }),
});
