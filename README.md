# Payload Plugin Multiple MongoDB connections

This plugin allows you a separate MongoDB connection for different collections.
Install:
Add to `package.json` to install directly from GitHub
```
"@payloadcms/mulitple-mongodb-connections": "payloadcms/example-multiple-mongodb-connections-2.0#package",
```
Or copy the source code to your project.


Usage:
Add to `plugins`:
```ts
 secondaryDBPlugin({
  collections: ['second-db-pages'], // collections for the second DB
  secondDBUrl: 'mongodb://127.0.0.1/database2', // second DB connection string
}),
```