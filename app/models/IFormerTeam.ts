interface IFormerTeam {
  id: number;
  // user: IUser; // user might never be needed so we don't need to fill it
  name: string;
  from: Date;
  to: Date;
}

export default IFormerTeam;
