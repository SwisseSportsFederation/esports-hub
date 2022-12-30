import { cantons, languages } from "@prisma/client";


interface IDetailContantBlockProps {
  fullName?: string;
  age?: number;
  languages?: languages[];
  canton?: cantons;
  website?: string;
  description?: string;
}

const DetailContentBlock = (props: IDetailContantBlockProps) => {
  const { fullName, age, languages, canton, website, description } = props;
  return (
    <div className="p-4 rounded-xl bg-white dark:bg-gray-2">
      <p className="font-bold text-lg">Details</p>
      {fullName &&
      <div className="flex flex-row justify-between">
        <b>Full Name</b>
        <span>{fullName}</span>
      </div>
      }
      {age &&
      <div className="flex flex-row justify-between">
          <b>Age</b>
          <span>{age}</span>
        </div>
      }
      {languages && languages.length > 0 &&
      <div className="flex flex-row justify-between">
        <b>Languages</b>
        <span>{languages.map((language: languages) => language.name).join(", ")}</span>
      </div>
      }
      {canton &&
      <div className="flex flex-row justify-between">
        <b>Canton</b>
        <span>{canton.name}</span>
      </div>
      }
      {website &&
      <div className="flex flex-row justify-between">
        <b>Website</b>
        <span><a href={website} className="text-red-1">{website}</a></span>
      </div>
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
