import { useLoaderData } from "@remix-run/react";
import type { Membership } from "~/services/admin/index.server";
import { AccessRight } from "@prisma/client";
import IconButton from "./Button/IconButton";
import { NavLink } from "@remix-run/react";
import Icon from "./Icons";
import type { IconType } from "./Icons";
import classNames from "classnames";

interface ILinkBlockProps {
  path: string,
  title: string,
  icon?: IconType
}

const NavbarLink = ({path, title, icon = 'arrowDown'}: ILinkBlockProps) => {
  const iconClassNames = classNames({
    'transform -rotate-90': icon === 'arrowDown',
    'rounded-full bg-gray-100 dark:bg-gray-3': icon === 'edit'
  }, "p-0 m-0")
  return <NavLink to={path} className={({isActive}) => 'text-color rounded-2xl hover:bg-gray-6 dark:hover:bg-gray-3' +
    ' flex items-center justify-between px-4 py-1 mb-1 transition' + (isActive ? ' bg-gray-6 dark:bg-gray-3' : ' bg-white dark:bg-gray-2')}>
    {title}
    <div className={iconClassNames}>
      <Icon iconName={icon} className='w-7 h-7'/>
    </div>
  </NavLink>;
}

const membershipLinkBlock = (membership: Membership, type: string) => {
  if(membership.access_rights === AccessRight.ADMINISTRATOR || membership.access_rights === AccessRight.MODERATOR) {
    return <NavbarLink path={`/admin/${type}/${membership.handle}`} title={membership.name} icon="edit" key={membership.name}/>
  }
  return <NavbarLink path={`/detail/${type}/${membership.handle}`} title={membership.name} key={membership.name}/>
}

export default function Navbar() {
  const { memberships } = useLoaderData();

  return <div className="hidden lg:block h-full z-10 fixed top-16 bg-white dark:bg-gray-2 w-72 text-color p-4 overflow-y-auto">
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
