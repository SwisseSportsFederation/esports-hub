import React from "react";
import { json } from "@remix-run/node";

type IdAndName = {
  id: string,
  name: string
}

type Team = {
  image: string
  name: string
  shortName: string
  game?: IdAndName
  description: string
  website: string
  canton?: IdAndName
  languages: IdAndName[]
}

export const loader = () => {
  return json({});
};

export default function() {
  return (
    <div className="mx-3">
      hello
    </div>
  );
};

