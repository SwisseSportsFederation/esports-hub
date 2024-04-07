# Swiss Esports Database
## About this project
The Swiss Esports Database is a platform for all Entities envolved in Swiss Esports. This currently covers players, staff, teams and organisations. In the future the project may also include sponsors.

On the web application you can find all entities and their relations. Information for this is provided by the entities themselves by creating accounts and updating their data. With this they can promote themselves, their team and organisation.


## Switch to right node version

It is recommended to use the node version manager, which can manage multiple node version on your machine and can define a node version per project.This makes it independent from your global node version on your machine.

On Windows, you might need to remove your current node installation in order to delegate the node installs to nvm.

#### For Linux based systems

1. Get nvm: https://github.com/nvm-sh/nvm
2. Execute `nvm use`

#### For Windows
1. Get nvm: https://github.com/coreybutler/nvm-windows
2. Execute `nvm-win.bat`

Note: nvm for windows unfortunately can't read the node version from the .nvmrc file, so the batch script helps you interpret it.

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
MINIO_ENDPOINT=xxxxx
MINIO_ACCESS_KEY=xxxxx
MINIO_SECRET_KEY=xxxxx
MINIO_BUCKET_NAME=xxxxx
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
