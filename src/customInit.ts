import { type MongooseAdapter } from '@payloadcms/db-mongodb'
import mongoose from 'mongoose'

import type { PaginateOptions } from 'mongoose'
import type { Init } from 'payload/database'
import type { SanitizedCollectionConfig } from 'payload/types'

import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'
import paginate from 'mongoose-paginate-v2'
import { buildVersionCollectionFields, buildVersionGlobalFields } from 'payload/versions'

import buildCollectionSchema from '@payloadcms/db-mongodb/dist/models/buildCollectionSchema.js'
import { buildGlobalModel } from '@payloadcms/db-mongodb/dist/models/buildGlobalModel.js'
import buildSchema from '@payloadcms/db-mongodb/dist/models/buildSchema'
import getBuildQueryPlugin from '@payloadcms/db-mongodb/dist/queries/buildQuery'
import { getDBName } from '@payloadcms/db-mongodb/dist/utilities/getDBName'
import { CollectionModel } from '@payloadcms/db-mongodb/dist/types'

export const customInit: Init = async function init(this: MongooseAdapter) {
  this.payload.config.collections.forEach((collection: SanitizedCollectionConfig) => {
    const currentInstance = (global as any).currentInstance ?? 1

    if (collection.custom?.instance && collection.custom.instance !== currentInstance) {
      return
    }

    const schema = buildCollectionSchema(collection, this)

    if (collection.versions) {
      const versionModelName = getDBName({
        config: collection,
        versions: true,
      })

      const versionCollectionFields = buildVersionCollectionFields(collection)

      const versionSchema = buildSchema(this, versionCollectionFields, {
        disableUnique: true,
        draftsEnabled: true,
        indexSortableFields: this.payload.config.indexSortableFields,
        options: {
          minimize: false,
          timestamps: false,
          ...this.schemaOptions,
          ...(this.collectionOptions[collection.slug]?.schemaOptions || {}),
        },
      })

      versionSchema.plugin<any, PaginateOptions>(paginate, { useEstimatedCount: true }).plugin(
        getBuildQueryPlugin({
          collectionSlug: collection.slug,
          versionsFields: versionCollectionFields,
        }),
      )

      if (collection.versions?.drafts) {
        versionSchema.plugin(mongooseAggregatePaginate)
      }

      const model = mongoose.model(
        versionModelName,
        versionSchema,
        this.autoPluralization === true ? undefined : versionModelName,
      ) as CollectionModel
      this.versions[collection.slug] = model
    }

    const model = mongoose.model(
      getDBName({ config: collection }),
      schema,
      this.autoPluralization === true ? undefined : collection.slug,
    ) as CollectionModel
    this.collections[collection.slug] = model

    // TS expect error only needed until we launch 2.0.0
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    this.payload.collections[collection.slug] = {
      config: collection,
    }
  })

  const model = buildGlobalModel(this) as any
  this.globals = model

  this.payload.config.globals.forEach(global => {
    if (global.versions) {
      const versionModelName = getDBName({ config: global, versions: true })

      const versionGlobalFields = buildVersionGlobalFields(global)

      const versionSchema = buildSchema(this, versionGlobalFields, {
        disableUnique: true,
        draftsEnabled: true,
        indexSortableFields: this.payload.config.indexSortableFields,
        options: {
          minimize: false,
          timestamps: false,
          ...this.schemaOptions,
          ...(this.globalsOptions.schemaOptions || {}),
        },
      })

      versionSchema
        .plugin<any, PaginateOptions>(paginate, { useEstimatedCount: true })
        .plugin(getBuildQueryPlugin({ versionsFields: versionGlobalFields }))

      const versionsModel = mongoose.model(
        versionModelName,
        versionSchema,
        versionModelName,
      ) as CollectionModel
      this.versions[global.slug] = versionsModel
    }
  })
}
