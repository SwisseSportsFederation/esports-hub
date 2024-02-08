import { zx } from 'zodix';
import { z } from 'zod';
import { checkUserAuth } from '~/utils/auth.server';
import { db } from '~/services/db.server';
import { redirect } from '@remix-run/node';
import { createFlashMessage } from '~/services/toast.server';
import { AccessRight, EntityType, RequestStatus } from '@prisma/client';
import { AuthUser } from '~/services/auth.server';
import { resize, upload } from '~/services/admin/api/cloudflareImages.server';

const createGroup = async (handle: string, name: string, description: string, entityType: EntityType, user: AuthUser) => {
  const group = await db.group.create({
    data: {
      handle,
      name,
      description,
      group_type: entityType,
    },
  });
  await db.groupMember.create({
    data: {
      access_rights: AccessRight.ADMINISTRATOR,
      is_main_group: false,
      request_status: RequestStatus.ACCEPTED,
      joined_at: new Date(),
      role: 'Admin',
      user: {connect: {id: BigInt(user.db.id)}},
      group: {connect: {id: group.id}},
    },
  });
  return group.id.toString();
};

export const createEntity = async (request: Request) => {
  const form = await request.clone().formData();
  const file = form.get('file') as File;
  let {
    id,
    founded,
    handle,
    name,
    description,
    game,
    street,
    zip,
    canton,
    languages,
    entityType,
    crop,
  } = await zx.parseForm(request, {
    id: z.string(),
    handle: z.string().min(3),
    name: z.string().min(3),
    founded: z.string().optional(),
    game: zx.NumAsString.optional(),
    street: z.string().optional(),
    zip: z.string().optional(),
    description: z.string(),
    canton: zx.NumAsString.optional(),
    languages: z.string(),
    entityType: z.string(),
    crop: z.string().optional(),
  });
  const languageIds = (JSON.parse(languages) as string[]).map(langId => ({id: Number(langId)}));

  const user = await checkUserAuth(request);

  id = await createGroup(handle, name, description, entityType as EntityType, user);
  let imageId: string | undefined = undefined;
  if (crop && file) {
    const cropData = JSON.parse(crop);
    const croppedImage = await resize(file, cropData);
    const {result} = await upload(croppedImage);
    imageId = result.id;
  }

  await db.group.update({
    where: {
      id: Number(id),
    },
    data: {
      handle,
      name,
      image: imageId,
      description,
      ...(founded && ({founded: new Date(founded)})),
      ...(!founded && ({founded: null})),
      ...(game && ({
        game: {
          connect: {
            id: Number(game),
          },
        },
      })),
      street,
      zip,
      ...(canton && {
        canton: {
          connect: {
            id: canton,
          },
        },
      }),
      ...(!canton && {
        canton: {
          disconnect: true,
        },
      }),
      languages: {
        set: languageIds,
      },
    },
  });

  const headers = await createFlashMessage(request, entityType.toLowerCase() + ' created');

  return redirect(`/admin/${entityType}/${handle}/details`, headers);
};
