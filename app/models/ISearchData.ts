import IGame from "./IGame";

type ISearchData = {
  id: number,
  name: string,
  suffix: string,
  image: string,
  games: IGame[],
  entityType: string,
}

export default ISearchData;
