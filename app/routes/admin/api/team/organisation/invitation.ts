import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { db } from "~/services/db.server";
import { zx } from 'zodix';
import { z } from "zod";
import { checkIdAccessForEntity, checkUserAuth } from "~/utils/auth.server";
import { RequestStatus } from "@prisma/client";

export let loader: LoaderFunction = () => redirect("/admin");

export const action: ActionFunction = async ({ request }) => {
  const { action, entityId: team_id, orgId: organisation_id } = await zx.parseForm(request, {
    action: z.enum(['ACCEPT', 'DECLINE']),
    entityId: zx.NumAsString,
    orgId: zx.NumAsString
  });
  const user = await checkUserAuth(request);
  const currentRequestStatus = await db.organisationTeam.findFirst({
    where: {
      organisation_id,
      team_id
    },
    select: {
      request_status: true
    }
  });
  if(currentRequestStatus?.request_status !== RequestStatus.PENDING_ORG) {
    await checkIdAccessForEntity(user.db.id, team_id, 'TEAM', 'ADMINISTRATOR');
  }

  try {
    if(action === 'ACCEPT') {
      const currentTeam = await db.organisationTeam.findFirst({
        where: {
          team_id,
          request_status: 'ACCEPTED'
        }});
      if(!currentTeam) {
        await db.organisationTeam.update({
          where: {
            team_id_organisation_id: {
              team_id,
              organisation_id
            }
          },
          data: {
            request_status: 'ACCEPTED'
          }
        });
      } else {
        throw new Error("Already in team.");
      }
    } else {
      await db.organisationTeam.delete({
        where: {
          team_id_organisation_id: {
            team_id,
            organisation_id
          }
        }
      });
    }
  } catch(error) {
    throw json({}, 400);
  }
  return json({});
};
