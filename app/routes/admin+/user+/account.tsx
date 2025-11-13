import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, useFetcher, useLoaderData } from "@remix-run/react";
import { useState } from 'react';
import styles from 'react-image-crop/dist/ReactCrop.css?url';
import { z } from "zod";
import { zx } from 'zodix';
import EntityDetailBlock from "~/components/Blocks/EntityDetailBlock";
import ActionButton from '~/components/Button/ActionButton';
import AskModalBody from '~/components/Notifications/AskModalBody';
import Modal from '~/components/Notifications/Modal';
import H1 from '~/components/Titles/H1';
import { entityToPathSegment } from '~/helpers/entityType';
import { updateEmail } from "~/services/admin/api/user.server";
import { db } from "~/services/db.server";
import { getSearchParams } from "~/services/search.server";
import { createFlashMessage } from "~/services/toast.server";
import dateInputStyles from "~/styles/date-input.css?url";
import { checkUserAuth, checkUserValid, logout } from "~/utils/auth.server";

export function links() {
  return [
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: dateInputStyles }
  ];
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const { handle, name, surname, email, birthDate, description, canton, languages, has_data_policy, is_searchable } = await zx.parseForm(request, {
    handle: z.string().min(2),
    name: z.string().min(3),
    surname: z.string().optional(),
    email: z.string().email('Email is not correct').optional(),
    birthDate: z.string().optional(),
    description: z.string().optional(),
    canton: zx.NumAsString.optional(),
    languages: z.string(),
    has_data_policy: z.string(),
    is_searchable: z.string().optional(),
  });
  const user = await checkUserAuth(request);
  try {
    if (handle === email) {
      const headers = await createFlashMessage(request, `Nickname cannot be email`);
      return json({}, { status: 400, ...headers });
    }
    if (!handle.match(/^[a-zA-Z0-9äöü_-]+$/)) {
      const headers = await createFlashMessage(request, `Nickname cannot contain special characters`);
      return json({}, { status: 400, ...headers });
    }

    const languageIds = (JSON.parse(languages) as string[]).map(langId => ({ id: Number(langId) }));
    const user_id = Number(user.db.id);
    await db.user.update({
      where: {
        id: Number(user.db.id)
      },
      data: {
        handle,
        name,
        surname,
        ...(birthDate && ({ birth_date: new Date(birthDate) })),
        ...(!birthDate && ({ birth_date: null })),
        description,
        ...(canton && {
          canton: {

            connect: {
              id: canton
            }
          }
        }),
        ...(!canton && {
          canton: {
            disconnect: true
          }
        }),
        languages: {
          set: languageIds
        },
        ...(has_data_policy && ({ has_data_policy: true })),
        ...({ is_searchable: !!is_searchable }),
      }
    });

    if (!!email && email !== user.db.email) {
      await updateEmail(user, user_id, email);
      return logout(request, '/auth/verify');
    }
  } catch (error: any) {
    console.log(error);
    const headers = await createFlashMessage(request, `Error updating user: ${error.message ?? ''}`);
    return json({}, { status: 500, ...headers });
  }
  const headers = await createFlashMessage(request, 'Account update is done');
  return json({}, headers);
};

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await checkUserAuth(request);
  const userData = await db.user.findFirst({
    where: {
      id: Number(user.db.id)
    },
    include: {
      canton: true,
      languages: true,
      games: true
    }
  });
  const userValid = await checkUserValid(user.db.id, request.url);

  if (!userData) {
    throw json({}, 404);
  }

  return json({
    user: userData,
    userValid,
    searchParams: await getSearchParams()
  });
}

export default function () {
  const { user, userValid, searchParams } = useLoaderData<typeof loader>();
  const [modalOpen, setModalOpen] = useState(false);
  const fetcher = useFetcher();
  const handleDelete = () => {
    setModalOpen(false);
    const path = entityToPathSegment('USER');
    fetcher.submit({
      entityId: user.id.toString(),
    }, {
      method: 'delete',
      action: `/admin/api/${path}`,
    });
  };
  return <>
    {!userValid &&
      <div className="w-full mx-auto max-w-prose lg:mx-0 mb-4">
        <div className="p-2 rounded-xl bg-red-1 text-white text-center">Please fill out all the info about you.</div>
      </div>
    }
    <EntityDetailBlock {...user} entityId={user.id} entityType='USER' entityBirthday={user.birth_date}
      imageId={user.image} searchParams={searchParams} />
    {userValid &&
      <div className="bg-red-600/25 py-8 lg:pb-12 my-8 px-4 lg:px-8 -mx-4 lg:-mx-8">
        <div className="w-full mx-auto lg:mx-0">
          <H1>Danger Zone</H1>
          <div className="flex flex-col items-center max-w-prose mx-auto lg:items-start lg:mx-0 mt-8 gap-4">
            <ActionButton content="Change Password" action={() => fetcher.submit({}, {
              action: '/admin/api/password',
              method: 'post',
            })} />
            <ActionButton content="Delete" action={() => setModalOpen(true)} />
          </div>
        </div>
      </div>
    }
    <Modal isOpen={modalOpen} handleClose={() => setModalOpen(false)}>
      <AskModalBody message={`Do you really want to delete your account?`}
        primaryButton={{ text: 'Yes', onClick: handleDelete }}
        secondaryButton={{ text: 'No', onClick: () => setModalOpen(false) }} />
    </Modal>
  </>
}
