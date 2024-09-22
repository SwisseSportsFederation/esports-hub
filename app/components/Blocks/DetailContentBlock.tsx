import type { Canton, Language } from "@prisma/client";
import type { StringOrNull } from "~/db/queries.server";


interface IDetailContentBlockProps {
  fullName?: string;
  age?: number;
  languages?: Language[];
  canton?: Canton | null;
  website?: StringOrNull;
  description: StringOrNull;
}

const DetailContentBlock = (props: IDetailContentBlockProps) => {
  const { fullName, age, languages, canton, website, description } = props;
  return (
    <div className="p-4 rounded-xl bg-white dark:bg-gray-2">
      <h2 className="font-bold text-lg">Details</h2>
      <table className="table-auto mt-2 border-separate border-spacing-x-4 max-w-full">
        <tbody>
          {fullName &&
            <tr>
              <td>Full Name</td>
              <td>{fullName}</td>
            </tr>
          }
          {age &&
            <tr>
              <td>Age</td>
              <td>{age}</td>
            </tr>
          }
          {languages && languages.length > 0 &&
            <tr>
              <td>Languages</td>
              <td>{languages.map((language: Language) => language.name).join(", ")}</td>
            </tr>
          }
          {canton &&
            <tr>
              <td>Canton</td>
              <td>{canton.name}</td>
            </tr>
          }
          {website &&
            <tr>
              <td>Website</td>
              <td><a href={website} className="text-red-1">{website}</a></td>
            </tr>
          }
        </tbody>
      </table>
      {description &&
        <div className="pt-4">
          <h3 className="font-bold block text-lg">Description</h3>
          <p className="ml-4 mt-2">{description}</p>
        </div>
      }
    </div>
  );
};

export default DetailContentBlock;
