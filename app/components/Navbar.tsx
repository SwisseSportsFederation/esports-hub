import { useLoaderData } from "@remix-run/react";
import { Membership } from "~/services/admin/index.server";
import { AccessRight } from "@prisma/client";
import IconButton from "./Button/IconButton";
import { Link } from "@remix-run/react";
import Icon from "./Icons";
import { IconType } from "./Icons";
import classNames from "classnames";

interface ILinkBlockProps {
  path: string,
  title: string,
  icon?: IconType
}

const NavbarLink = ({path, title, icon = 'arrowDown'}: ILinkBlockProps) => {
  const iconClassNames = classNames({
    'transform -rotate-90': icon === 'arrowDown'
  }, "p-0 m-0")
  return <Link to={path} className={'text-black dark:text-white rounded-2xl bg-white' +
    ' hover:bg-gray-6 dark:bg-gray-2 dark:hover:bg-gray-3 flex items-center justify-between px-4 py-1 mb-1'}>
    {title}
    <div className={iconClassNames}>
      <Icon iconName={icon} className='w-7 h-7'/>
    </div>
  </Link>;
}

const membershipLinkBlock = (membership: Membership, type: string) => {
  if(membership.access_rights === AccessRight.ADMINISTRATOR || membership.access_rights === AccessRight.MODERATOR) {
    return <NavbarLink path={`/admin/${type}/${membership.handle}`} title={membership.name} icon="edit"/>
  }
  return <NavbarLink path={`/detail/${type}/${membership.handle}`} title={membership.name}/>
}

export default function Navbar() {
  const { memberships } = useLoaderData();

  return <div className="hidden lg:inline-block bg-white dark:bg-gray-2 w-80 text-black dark:text-white p-4 -mt-5 min-h-screen">
    <div className="mb-16">
      <div className="text-xl font-bold mb-4">User</div>
      <NavbarLink path={`/admin/user/account`} title="Account"/>
      <NavbarLink path={`/admin/user/games`} title="Games"/>
      <NavbarLink path={`/admin/user/socials`} title="Socials"/>
      <NavbarLink path={`/admin/teams`} title="My Teams"/>
      <NavbarLink path={`/admin/organisations`} title="My Organisations"/>
    </div>
    <div className="mb-16">
      <div className="text-xl font-bold mb-4 flex">
        <span>Teams</span> 
        <div className="ml-3">
          <IconButton icon={"add"} type='link' path="/admin/create/team" size="small"/>
        </div>
      </div>
      {  memberships.teams.map((team: Membership) => membershipLinkBlock(team, "team")) }
    </div>
    <div className="mb-16">
      <div className="text-xl font-bold mb-4 flex">
        <span>Organisations</span>
        <div className="ml-3">
          <IconButton icon={"add"} type='link' path="/admin/create/organisation" size="small"/>
        </div>
      </div>
      { memberships.orgs.map((organisation: Membership) => membershipLinkBlock(organisation, "organisation"))}
    </div>
  </div>
}