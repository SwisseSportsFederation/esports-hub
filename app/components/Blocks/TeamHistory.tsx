import type { FormerTeam, Group, GroupMember } from "@prisma/client";
import { Link } from "@remix-run/react";
import type { SerializeFrom } from "@remix-run/server-runtime";


interface ITeamHistoryProps {
  memberships?: (SerializeFrom<GroupMember> & { group: SerializeFrom<Group> })[],
  formerTeams?: SerializeFrom<FormerTeam>[],
}

const TeamHistory = ({ formerTeams = [], memberships: teams = [] }: ITeamHistoryProps) => {
  if(formerTeams.length === 0 && teams.length === 0) {
    return null;
  }

  return (
    <div className="p-4 rounded-xl bg-white dark:bg-gray-2">
      <div className="font-bold text-lg">Team-History</div>
      {teams.map((membership) =>
        <div key={Number(membership.group.id)} className="flex justify-items-auto mb-2">
          {membership.joined_at && <div className="w-6/12">{new Date(membership.joined_at).getFullYear()} -</div>}
          <div className="text-red-1 w-6/12 flex justify-end content-end">
            <Link to={`/detail/team/${membership.group.handle}`}>
              {membership.group.name}
            </Link>
          </div>
        </div>
      )}
      {formerTeams.map((formerTeam) =>
        <div key={Number(formerTeam.id)} className="flex justify-items-auto mb-2">
          {
            formerTeam.from && formerTeam.to &&
            <div className="w-6/12">
              {new Date(formerTeam.from).getFullYear()} - {new Date(formerTeam.to).getFullYear()}
            </div>
          }
          <div className="w-6/12 flex justify-end content-end">{formerTeam.name}</div>
        </div>
      )}
    </div>
  );
};

export default TeamHistory;
