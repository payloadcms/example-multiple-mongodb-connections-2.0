import { mongooseAdapter, type MongooseAdapter } from "@payloadcms/db-mongodb";
import { Config } from "payload/config";
import mongoose from "mongoose";
import { type Payload } from "payload";
import { type BaseDatabaseAdapter } from "payload/database";

import path from "path";
import { customInit } from "./customInit";

export const extendWebpackConfig = (config: Config) => (webpackConfig) => {
  const existingWebpackConfig =
    typeof config.admin?.webpack === "function"
      ? config.admin.webpack(webpackConfig)
      : webpackConfig;

  return {
    ...existingWebpackConfig,
    resolve: {
      ...(existingWebpackConfig.resolve || {}),
      alias: {
        ...(existingWebpackConfig.resolve?.alias || {}),
        [path.resolve(__dirname, "customInit")]: path.resolve(
          __dirname,
          "./mock.js"
        ),
      },
    },
  };
};

export const secondaryDBPlugin =
  ({
    collections,
    secondDBUrl,
  }: {
    secondDBUrl: string;
    collections: string[];
  }) =>
  async (config: Config) => {
    const webpack = extendWebpackConfig(config);

    config = { ...config };

    config.admin = {
      ...(config.admin || {}),
      webpack,
    };

    const defaultAdapterConfig = config.db;

    for (const collection of config.collections ?? []) {
      collection.custom = collection.custom ?? {};
      if (collections.includes(collection.slug)) {
        collection.custom.instance = 2;
      } else {
        collection.custom.instance = 1;
      }
    }

    const adapter: (args: { payload: Payload }) => BaseDatabaseAdapter = ({
      payload,
    }) => {
      const secondAdapter = mongooseAdapter({
        url: secondDBUrl,
      })({ payload });

      let defaultAdapter = defaultAdapterConfig({ payload }) as MongooseAdapter;

      secondAdapter.payload = payload;

      return new Proxy(defaultAdapter, {
        get(target, p) {
          if (p === "init") {
            return async function init() {
              target.connection = await mongoose
                .createConnection(defaultAdapter.url as string, {
                  autoIndex: true,
                  ...defaultAdapter.connectOptions,
                })
                .asPromise();

              mongoose.model = (...args: any[]) => {
                // @ts-expect-error
                return target.connection.model(...args);
              };

              let client = target.connection.getClient();

              if (!client.options.replicaSet) {
                target.transactionOptions = false;
                target.beginTransaction = undefined;
              }

              global.currentInstance = 1;
              await customInit.bind(target)(payload);

              secondAdapter.connection = await mongoose
                .createConnection(secondDBUrl, {
                  autoIndex: true,
                  ...defaultAdapter.connectOptions,
                })
                .asPromise();

              payload.logger.info("Connected to the main database");

              mongoose.model = (...args: any[]) => {
                // @ts-expect-error
                return secondAdapter.connection.model(...args);
              };

              client = secondAdapter.connection.getClient();

              if (!client.options.replicaSet) {
                secondAdapter.transactionOptions = false;
                secondAdapter.beginTransaction = undefined;
              }

              global.currentInstance = 2;

              await customInit.bind(secondAdapter)(payload);

              payload.logger.info("Connected to the secondary database");
            };
          }

          if (p === "connect") {
            return function () {};
          }

          const value = target[p];

          if (typeof value === "function") {
            return function (...args: unknown[]) {
              let firstArg = args[0];
              if (
                firstArg &&
                typeof firstArg === "object" &&
                "collection" in firstArg &&
                typeof firstArg.collection === "string" &&
                collections.includes(firstArg.collection)
              ) {
                return Reflect.apply(secondAdapter[p], secondAdapter, args);
              }

              let val = target[p](...args);

              return val;
            };
          }

          return target[p];
        },
      });
    };

    config.db = adapter;

    return config;
  };
