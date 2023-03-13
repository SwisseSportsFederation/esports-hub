# Swiss Esports Database
## About this project
The Swiss Esports Database is a platform for all Entities envolved in Swiss Esports. This currently covers players, staff, teams and organisations. In the future the project may also include sponsors.

On the web application you can find all entities and their relations. Information for this is provided by the entities themselves by creating accounts and updating their data. With this they can promote themselves, their team and organisation.

## Installation

```sh
yarn install
yarn prisma db push
yarn prisma db seed
```

## ENV

```dotenv
SESSION_SECRET=xxxxx
DATABASE_URL="postgresql://sesf:sesf@localhost:5433/sesf?schema=public"
AUTH0_CLIENT_ID="FxDqC9cvJ3ot7XCyEbblFYMjN8ipTZ2z"
AUTH0_CLIENT_SECRET=xxxxx
AUTH0_DOMAIN="sesf.eu.auth0.com"
AUTH0_CALLBACK_URL="http://localhost:3000/auth/callback"
CLOUDFLARE_BEARER=xxxxx
```
Replace xxxxx with the proper values
## Development

From your terminal (for now locally only in dev mode):

```sh
yarn dev
```

This starts your app in development mode, rebuilding assets on file changes.

If the database layout was changed be sure to use:

```sh
yarn prisma migrate reset --force
yarn prisma db seed
```

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
