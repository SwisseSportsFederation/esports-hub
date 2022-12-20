import ICanton from "../../models/ICanton";
import ILanguage from "../../models/ILanguage";

interface IDetailContantBlockProps {
  fullName?: string;
  age?: number;
  languages?: ILanguage[];
  canton?: ICanton;
  website?: string;
  description?: string;
}

const DetailContentBlock = (props: IDetailContantBlockProps) => {
  const { fullName, age, languages, canton, website, description } = props;
  return (
    <div className="p-4 rounded-xl bg-white dark:bg-gray-2">
      <span className="font-bold text-lg">Details</span>
      {fullName &&
      <p>Full Name: {fullName}</p>
      }
      {age &&
      <p>Age: {age}</p>
      }
      {languages && languages.length > 0 &&
      <p>Languages: {languages.map((language: ILanguage) => language.name).join(", ")}</p>
      }
      {canton &&
      <p>Canton: {canton.name}</p>
      }
      {website &&
      <p>Website: <a href={website} className="text-red-1">{website}</a></p>
      }
      {description &&
      <div className="pt-4">
        <span className="font-bold block text-lg">Description</span>
        <p>{description}</p>
      </div>
      }
    </div>
  );
};

export default DetailContentBlock;
