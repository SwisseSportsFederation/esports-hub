import {useLoaderData} from "@remix-run/react";
import {checkUserAuth} from "~/utils/auth.server";
import {db} from "~/services/db.server";
import {LoaderFunction, json} from "@remix-run/node";
import {getOrganisationMemberTeasers, getTeamTeasers} from "~/utils/teaserHelper";
import TeaserList from "~/components/Teaser/TeaserList";
import ActionButton from "~/components/Button/ActionButton";
import DetailContentBlock from "~/components/Blocks/DetailContentBlock";
import DetailHeader from "~/components/Blocks/DetailHeader";
import { isOrganisationMember, getOrganisationGames} from "~/utils/entityFilters";
import { RequestStatus } from "@prisma/client";
// const { addNotification } = useNotification(); // TODO add notification logic

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await checkUserAuth(request);
  const id = Number(params.id);

  /* TODO check query */
  const organisation = await db.organisation.findUniqueOrThrow({
    where: {
      id: id
    },
    select: {
      short_name: true,
      name: true,
      image: true,
      description: true,
      canton: true,
      languages: true,
      socials: true,
      website: true,
      teams: {
        where: {
          request_status: {
            equals: RequestStatus.ACCEPTED
          }
        }
      },
      members: {
        where: {
          request_status: {
            equals: RequestStatus.ACCEPTED
          }
        },
        include: { user: true }
      }
    }
  }).catch(() => { 
      throw new Response("Not Found", {
        status: 404,
      }) })

  const teamTeasers = getTeamTeasers(organisation?.teams);
  const isMember = isOrganisationMember(organisation?.members, user.profile.id ?? "");
  const memberTeasers = getOrganisationMemberTeasers(organisation?.members);

  const result = {
    user,
    organisation,
    teamTeasers,
    isMember,
    memberTeasers
  }

  return json(result);
};

export default function() {
  const data = useLoaderData();

  const handleActionClick = async () => {
    //addNotification("Error", 3000);
    /* TODO later apply button
    const [, error] = await authenticatedFetch(`/users/${user.profile.id}/organisation/apply`, {
      method: 'PUT',
      body: JSON.stringify({
        userId: user.profile.id,
        organisationId: organisation.id,
        isMainTeam: false,
        joinedAt: new Date().toISOString(),
        role: ""
      })
    }, token);
  
    if (error) {
      addNotification("Error", 3000);
      console.error(error);
      return;
    }
  
    addNotification("Success", 3000);
    await mutate();*/
  };

  return <div className="mx-3">
    <div className="max-w-prose lg:max-w-4xl w-full mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-y-4 lg:gap-6">
        <DetailHeader name={data.organisation.name}
                      imagePath={data.organisation.image}
                      entitySocials={data.organisation.socials}
                      games={getOrganisationGames(data.organisation)}
                      isMember={data.isMember}
                      onApply={handleActionClick} />
        <div className="col-span-2 space-y-4">
          <DetailContentBlock {...data.organisation} />
          <div className="-mx-4">
            <TeaserList title="Teams" teasers={data.teamTeasers} />
            <TeaserList title="Members" teasers={data.memberTeasers} />
          </div>
          { data.user && !data.isMember &&
              <div className="flex items-center justify-center my-7">
                <ActionButton content="Apply" action={handleActionClick} />
              </div>
          }
        </div>
      </div>
    </div>
  </div>;
};