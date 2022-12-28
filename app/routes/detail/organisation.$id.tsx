import {useLoaderData} from "@remix-run/react";
import {ReactNode} from "react";
import IconButton from "~/components/Button/IconButton";
import {checkUserAuth} from "~/utils/auth.server";
import {db} from "~/services/db.server";
import {LoaderFunction, json} from "@remix-run/node";
import {getOrganisationMemberTeasers, getTeamTeasers} from "~/utils/teaserHelper";
import TeaserList from "~/components/Teaser/TeaserList";
import ActionButton from "~/components/Button/ActionButton";
import DetailContentBlock from "~/components/Blocks/DetailContentBlock";
import DetailHeader from "~/components/Blocks/DetailHeader";
import {getAcceptedOrganisationTeams, isOrganisationMember, getOrganisationGames} from "~/utils/entityFilters";
import { organisations as Organisation } from "@prisma/client";
// const { addNotification } = useNotification(); // TODO add notification logic

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await checkUserAuth(request);
  const id = Number(params.id);

  /* TODO check query */
  const orgQuery = db.organisation.findUnique({
    where: {
      id: id
    },
    select: {
      short_name: true,
      name: true,
      image: true,
      members: {
        select: {
          request_status: true
        }
      }
    }
  });
  const organisations2: ([Organisation | null]) = await Promise.all([orgQuery]);
  const organisation = organisations2[0];

  const teamTeasers = getTeamTeasers(getAcceptedOrganisationTeams(organisation?.teams));
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

  const getTeaser = (memberships: Membership[], icons: ReactNode) => {
    return memberships.map((mem: Membership) => ({
      avatarPath: mem.image,
      name: mem.name ?? "",
      team: mem.short_name,
      games: [],
      icons: <>
        {icons}
      </>
    }));
  };

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

  const editIcon = <IconButton icon='edit' type="link" path='/admin/teams' />;
  const statusIcons = <>
    <IconButton icon='accept' type="button" action={() => console.log("a")} />
    <IconButton icon='decline' type="button" action={() => console.log("d")} />
  </>;
  const teamsTeaser = getTeaser(data.teams, editIcon);
  const orgTeaser = getTeaser(data.orgs, editIcon);
  const invitationTeaser = getTeaser(data.invitations, statusIcons);

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