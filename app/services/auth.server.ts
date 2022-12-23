import { Authenticator } from "remix-auth";
import type { Auth0Profile } from 'remix-auth-auth0';
import { Auth0Strategy } from 'remix-auth-auth0';
import { sessionStorage } from "~/services/session.server";
import { db } from "~/services/db.server";
import type { User } from '@prisma/client';

export type AuthUser = {
  db: User;
  profile: Auth0Profile;
};
export const authenticator = new Authenticator<AuthUser>(sessionStorage);


if(!process.env.AUTH0_CLIENT_ID) {
  throw new Error("Missing AUTH0_CLIENT_ID env");
}

if(!process.env.AUTH0_CLIENT_SECRET) {
  throw new Error("Missing AUTH0_CLIENT_SECRET env");
}

if(!process.env.AUTH0_DOMAIN) {
  throw new Error("Missing AUTH0_DOMAIN env");
}

authenticator.use(
  new Auth0Strategy(
    {
      callbackURL: "http://localhost:3000/auth/callback",
      clientID: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      domain: process.env.AUTH0_DOMAIN,
    },
    async ({ profile }) => {
      let user = await db.user.findUnique({
        where: {
          auth_id: profile.id
        }
      });
      if(!user) {
        try {
          user = await db.user.create({
            data: {
              nickname: '',
              name: '',
              surname: '',
              auth_id: profile.id,
              email: profile.emails![0].value
            }
          });
        } catch(error) {
          console.log(error);
          throw error;
        }
      }
      return {
        db: user,
        profile
      }
    }
  ));
