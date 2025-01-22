import { mongooseAdapter, type MongooseAdapter } from "@payloadcms/db-mongodb";
import { Config } from "payload/config";
import mongoose from "mongoose";
import { type Payload } from "payload";
import { type BaseDatabaseAdapter } from "payload/database";

export const secondaryDBPlugin =
  ({
    collections,
    secondDBUrl,
  }: {
    secondDBUrl: string;
    collections: string[];
  }) =>
  async (config: Config) => {
    const defaultAdapterConfig = config.db;

    let adapter: (args: { payload: Payload }) => BaseDatabaseAdapter = ({
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
                // @ts-expect-error err
                return target.connection.model(...args);
              };

              let client = target.connection.getClient();

              if (!client.options.replicaSet) {
                target.transactionOptions = false;
                target.beginTransaction = undefined;
              }

              await target.init(payload);

              secondAdapter.connection = await mongoose
                .createConnection(secondDBUrl, {
                  autoIndex: true,
                  ...defaultAdapter.connectOptions,
                })
                .asPromise();

              payload.logger.info("Connected to the main database");

              mongoose.model = (...args: any[]) => {
                // @ts-expect-error err
                return secondAdapter.connection.model(...args);
              };

              client = secondAdapter.connection.getClient();

              if (!client.options.replicaSet) {
                secondAdapter.transactionOptions = false;
                secondAdapter.beginTransaction = undefined;
              }

              await secondAdapter.init(payload);

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
