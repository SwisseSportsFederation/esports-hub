import { AccessRight, EntityType, Prisma, RequestStatus } from '@prisma/client';
import { json, redirect } from '@remix-run/server-runtime';
import { z } from 'zod';
import { zx } from 'zodix';
import { resize, upload } from '~/services/admin/api/cloudflareImages.server';
import { AuthUser } from '~/services/auth.server';
import { db } from '~/services/db.server';
import { createFlashMessage } from '~/services/toast.server';
import { checkUserAuth } from '~/utils/auth.server';

const createGroup = async (handle: string, name: string, description: string, entityType: EntityType, user: AuthUser) => {
  try {
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
        user: { connect: { id: BigInt(user.db.id) } },
        group: { connect: { id: group.id } },
      },
    });
    return group.id.toString();
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2002') {
        throw new Response("Bad Request", {
          status: 400,
          statusText: "Group cannot be created. Short name already taken."
        })
      } else {
        throw new Response("Server Error", {
          status: 500,
          statusText: `Server Error: ${e.code}`
        })
      }
    } else {
      throw new Response("Server Error", {
        status: 500,
        statusText: "Server Error"
      })
    }
  }
};

export const createEntity = async (request: Request) => {
  try {
    const form = await request.clone().formData();
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
      image
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
      image: z.string().optional()
    });
    const languageIds = (JSON.parse(languages) as string[]).map(langId => ({ id: Number(langId) }));

    const user = await checkUserAuth(request);

    id = await createGroup(handle, name, description, entityType as EntityType, user);
    let imageId: string | undefined = undefined;
    if (crop && image) {
      const cropData = JSON.parse(crop);
      const base64 = image.split('base64,')[1]
      const original = Buffer.from(base64, 'base64');
      const croppedImage = await resize(original, cropData);
      const { result } = await upload(croppedImage, 'image-' + id);
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
        ...(founded && ({ founded: new Date(founded) })),
        ...(!founded && ({ founded: null })),
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

  } catch (error: any) {
    const headers = await createFlashMessage(request, `Error creating team: ${error.statusText}`);
    return json({}, headers);
  }
};
