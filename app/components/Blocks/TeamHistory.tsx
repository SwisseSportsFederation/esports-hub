import { TeamMember, FormerTeam } from "@prisma/client";
import { Link } from "@remix-run/react";

interface ITeamHistoryProps {
    memberships?: TeamMember[],
    formerTeams?: FormerTeam[],
}

const TeamHistory = ({ formerTeams = [], memberships: teams = [] }: ITeamHistoryProps) => {
    if(formerTeams.length === 0 && teams.length === 0) {
      return null;
    }

    return (
      <div className="p-4 rounded-xl bg-white dark:bg-gray-2">
        <div className="font-bold text-lg">Team-History</div>
          { teams.map((membership: TeamMember) =>
            <div key={membership.team.id} className="flex justify-items-auto mb-2">
              <div className="w-6/12">{new Date(membership.joined_at).getFullYear()} -</div>
              <div className="text-red-1 w-6/12 flex justify-end content-end">
                <Link to={`/detail/team/${membership.team.id}`}>
                  <a>{membership.team.name}</a>
                </Link>
                
              </div>
            </div>
          )}
        { formerTeams.map((formerTeam: FormerTeam) =>
          <div key={formerTeam.id} className="flex justify-items-auto mb-2">
            <div className="w-6/12">{new Date(formerTeam.from).getFullYear()} - {new Date(formerTeam.to).getFullYear()}</div>
            <div className="w-6/12 flex justify-end content-end">{formerTeam.name}</div>
          </div>
        )}
      </div>
    );
};

export default TeamHistory;
