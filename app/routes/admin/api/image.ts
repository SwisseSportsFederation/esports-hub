import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { db } from "~/services/db.server";
import { zx } from 'zodix';
import { z } from "zod";
import { checkUserAuth } from "~/utils/auth.server";

export let loader: LoaderFunction = () => redirect("/admin");

export const action: ActionFunction = async ({ request }) => {
  if(request.method !== "POST") {
    throw json({}, 404);
  }
  const { file, entityId, entity } = await zx.parseForm(request, {
    file: z.instanceof(File),
    entityId: z.string(),
    entity: z.enum(["USER", "TEAM", "ORG"])
  });

  const user = await checkUserAuth(request);
  const entity_id = Number(entityId);




  return json({});
};
  // try {
  //   const membership = await db.organisationMember.findFirstOrThrow({
  //     where: {
  //       user_id: Number(user.db.id),
  //       organisation_id
  //     },
  //     select: {
  //       access_rights: true
  //     }
  //   });
  //
  //   if(membership.access_rights !== "ADMINISTRATOR") {
  //     return json({}, 403);
  //   }
  //
  //   await db.organisation.delete({
  //     where: {
  //       id: organisation_id
  //     }
  //   });
  // } catch(error) {
  //   throw json({}, 404)
  // }
// export const action: ActionFunction = async ({ request }) => {
//   const form = await request.formData();
//   const file = form.get('file') as File;
//   console.log(await file.text());
//
//   const buffer = await sharp(Buffer.from(await file.arrayBuffer()))
//     .extract({
//       top: 0,
//       left: 0,
//       height: 200,
//       width: 200
//     })
//     .resize({
//       height: 200,
//       width: 200
//     })
//     .png()
//     .toBuffer();
//   const testt = new File([buffer], file.name)
//   console.log(await testt.text());
//   const formData = new FormData();
//   formData.set("file", testt);
//   try {
//     const response = await fetch('https://api.cloudflare.com/client/v4/accounts/9f0e209fa6f3129765424f4a5e1e7415/images/v1', {
//       method: 'POST',
//       headers: {
//         'Authorization': 'Bearer kLYavG4xbl22RCc8Gw1BZ8FUo0-jzLyRdmODC4E1'
//       },
//       body: formData
//     }).then(res => res.text());
//     console.log(response);
//   } catch(error) {
//     console.log(error);
//   }
//   return json({});
// };
