# Swiss Esports Hub
## About this project
The Swiss Esports Hub is a platform for all Entities envolved in Swiss Esports. This currently covers players, staff, teams and organisations. In the future the project may also include sponsors.

On the web application you can find all entities and their relations. Information for this is provided by the entities themselves by creating accounts and updating their data. With this they can promote themselves, their team and organisation.

## Stack
- Remix
- Prisma
- PNPM (Version management)
- Zod

- Resend (Mailing)
- Auth0 (Authentication)
- Minio (asset pool)

## Switch to right node version

It is recommended to use the node version manager, which can manage multiple node version on your machine and can define a node version per project. This makes it independent from your global node version on your machine.

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
pnpm install
pnpm prisma db push
pnpm prisma db seed
```

## ENV
You can find an example env file with the name `.env.example`. Replace xxxxx with the proper values and rename it to `.env`


## Development

From your terminal (for now locally only in dev mode):

```sh
pnpm dev
```
This starts your app in development mode, rebuilding assets on file changes.


To start the database locally you can run it using docker compose:
```sh
docker compose up
```

## Deployment

First, build your app for production:

```sh
pnpm build
```

Then run the app in production mode:

```sh
pnpm start
```

Currently all deployments need to be pulled from Coolify instead of pipelines triggering deployments.

### Database Model Update
Change database url in .env file to local server.
```sh
pnpm prisma migrate status # check status of remote database
pnpm prisma migrate dev # update local database model to current prisma sheet.
```

### Database Deployment
Change database url in .env file to correct server. 

Warning: On Coolify Databases that only have a local link you will need to go into coolify and go to the project -> environment -> esports-hub app -> terminal tab. There you can execute it after doing a redeploy. This should be done automatically in the future with Github Actions, that are currently broken.
```sh
pnpm prisma migrate status # check status of remote database
pnpm prisma migrate deploy # deploy all new migrations without deleting data
```

### Database local issues
If you can't make it run and have problems with prisma migrations try to clean the database migrations with following commands (this will probably delete the whole local db and reseed it):
```sh
pnpm prisma migrate reset --force
pnpm prisma db seed
```
