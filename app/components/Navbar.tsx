import LinkBlock from "./Blocks/LinkBlock";
import { useLoaderData } from "@remix-run/react";
import { Membership } from "~/services/admin/index.server";
import { AccessRight } from "@prisma/client";
import IconButton from "./Button/IconButton";

const membershipLinkBlock = (membership: Membership, type: string) => {
  if(membership.access_rights === AccessRight.ADMINISTRATOR || membership.access_rights === AccessRight.MODERATOR) {
    return <LinkBlock path={`/admin/${type}/${membership.handle}`} title={membership.name}/>
  }
  return <LinkBlock path={`/detail/${type}/${membership.handle}`} title={membership.name}/>
}

export default function Navbar() {
  const { memberships } = useLoaderData();

  return <div className="hidden lg:inline-block bg-white dark:bg-gray-2 w-80 text-black dark:text-white p-4 -mt-5 min-h-screen">
    <div className="mb-16">
      <div className="text-xl font-bold mb-4">User</div>
      <LinkBlock path={`/admin/user/account`} title="Account"/>
      <LinkBlock path={`/admin/user/games`} title="Games"/>
      <LinkBlock path={`/admin/user/socials`} title="Socials"/>
      <LinkBlock path={`/admin/user/teams`} title="My Teams"/>
      <LinkBlock path={`/admin/user/organisations`} title="My Organisations"/>
    </div>
    <div className="mb-16">
      <div className="text-xl font-bold mb-4 flex">
        <span>Teams</span> 
        <div className="ml-3">
          <IconButton icon={"add"} type='link' path="/admin/team/0/details" size="small"/>
        </div>
      </div>
      {  memberships.teams.map((team: Membership) => membershipLinkBlock(team, "team")) }
    </div>
    <div className="mb-16">
      <div className="text-xl font-bold mb-4 flex">
        <span>Organisations</span>
        <div className="ml-3">
          <IconButton icon={"add"} type='link' path="/admin/organisation/0/details" size="small"/>
        </div>
      </div>
      { memberships.orgs.map((organisation: Membership) => membershipLinkBlock(organisation, "organisation"))}
    </div>
  </div>
}