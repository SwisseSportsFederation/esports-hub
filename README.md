### For not it just works locally in dev mode

## Installation

```sh
yarn install
```

## ENV

```dotenv
SESSION_SECRET=xxxxx
DATABASE_URL="postgresql://sesf:sesf@localhost:5433/sesf?schema=public"
AUTH0_CLIENT_ID="FxDqC9cvJ3ot7XCyEbblFYMjN8ipTZ2z"
AUTH0_CLIENT_SECRET=xxxxx
AUTH0_DOMAIN="sesf.eu.auth0.com"
```
Replace xxxxx with the proper values
## Development

From your terminal:

```sh
yarn dev
```

This starts your app in development mode, rebuilding assets on file changes.

## Deployment

First, build your app for production:

```sh
yarn build
```

Then run the app in production mode:

```sh
yarn start
```

Now you'll need to pick a host to deploy it to.
