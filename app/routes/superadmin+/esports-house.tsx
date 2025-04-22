import { json, useFetcher, useLoaderData, useOutletContext } from "@remix-run/react";
import type { LoaderFunctionArgs, SerializeFrom } from "@remix-run/server-runtime";
import { useState } from "react";
import ImageBasicUploadBlock from "~/components/Blocks/ImageBlock/ImageBasicUploadBlock";
import ActionButton from "~/components/Button/ActionButton";
import IconButton from "~/components/Button/IconButton";
import TextareaInput from "~/components/Forms/TextareaInput";
import TextInput from "~/components/Forms/TextInput";
import AskModalBody from "~/components/Notifications/AskModalBody";
import Modal from "~/components/Notifications/Modal";
import H1 from "~/components/Titles/H1";
import type { loader as superadminLoader } from "~/routes/superadmin+/_layout";
import { db } from "~/services/db.server";
import { checkSuperAdmin, checkUserAuth } from "~/utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await checkUserAuth(request);
  await checkSuperAdmin(user.db.id);
  const locations = await db.location.findMany({
    include: {
      prices: true
    }
  });
  return json({
    locations
  });
}

export default function () {
  const { locations } = useLoaderData<typeof loader>();
  const { user } = useOutletContext<SerializeFrom<typeof superadminLoader>>();
  const [showCreate, setShowCreate] = useState(false);
  const [showCreatePrice, setShowCreatePrice] = useState(false);
  const [showEdit, setShowEdit] = useState<BigInt[]>([]);
  const [showEditPrice, setShowEditPrice] = useState<BigInt[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState<string>("");
  const [showConfirmModalPrice, setShowConfirmModalPrice] = useState<string>("");
  const fetcher = useFetcher();
  const [imageReady, setImageReady] = useState(true);

  const toggleEdit = (locationId: BigInt) => {
    if (showEdit.includes(locationId)) {
      setShowEdit(showEdit.filter((id) => id !== locationId));
    } else {
      setShowEdit([...showEdit, locationId]);
    }
  }

  const toggleEditPrice = (priceId: BigInt) => {
    if (showEditPrice.includes(priceId)) {
      setShowEditPrice(showEditPrice.filter((id) => id !== priceId));
    } else {
      setShowEditPrice([...showEditPrice, priceId]);
    }
  }

  const deleteLocation = (locationId: string) => {
    fetcher.submit({
      locationId,
    }, {
      method: 'delete',
      action: `/superadmin/api/location`,
    });
  }

  const deleteLocationPrice = (priceId: string) => {
    fetcher.submit({
      priceId,
    }, {
      method: 'delete',
      action: `/superadmin/api/location-price`,
    });
  }

  const priceForm = (locationId: string, price?: any) => {
    return <fetcher.Form key={price?.id ?? 'new'} method={price ? 'PUT' : 'POST'} action={`/superadmin/api/location-price`} className="grid grid-cols-5 gap-2" onSubmit={() => {
      if (price) {
        setShowEditPrice(showEditPrice.filter((id) => id !== price.id));
      } else {
        setShowCreatePrice(false);
      }
    }}>
      {price && <input type="hidden" name="priceId" value={price?.id ?? ""} />}
      <input type="hidden" name="locationId" value={locationId ?? ""} />
      <TextInput id={`name`} label="Name" defaultValue={price?.name ?? ''} className="col-span-1" disabled={!showEditPrice.includes(price?.id) && price} />
      <TextInput id={`price`} label="Price" defaultValue={price?.price ?? ''} className="col-span-1" disabled={!showEditPrice.includes(price?.id) && price} />
      <TextInput id={`people_count`} label="People" defaultValue={price?.people_count ?? ''} className="col-span-1" disabled={!showEditPrice.includes(price?.id) && price} />
      <TextInput id={`duration`} label="Duration" defaultValue={price?.duration ?? ''} className="col-span-1" disabled={!showEditPrice.includes(price?.id) && price} />
      <div className="col-span-1 flex items-center gap-4 pl-2 pt-2">
        {price && <IconButton icon='edit' type='button' action={() => toggleEditPrice(price?.id)} />}
        {(showEditPrice.includes(price?.id) || !price) && <IconButton icon='add' type='submit' name='action' value={price ? 'PUT' : 'POST'} />}
        {(showEditPrice.includes(price?.id) && price) && <IconButton icon='decline' type='button' action={() => setShowConfirmModalPrice(price?.id)} />}
      </div>
    </fetcher.Form>
  }

  const locationForm = (location?: any) => {
    return <div>
      <fetcher.Form method={location ? 'PUT' : 'POST'} action={`/superadmin/api/location`} className="grid grid-cols-2 gap-6 mb-8">
        {location && <input type="hidden" name="locationId" value={location?.id ?? ""} />}
        <div className="col-span-2 flex justify-end">
          <IconButton icon='remove' type='button' action={() => { location ? toggleEdit(location.id) : setShowCreate(!showCreate) }} className="mt-4" />
        </div>
        <div className="col-span-2 lg:col-span-1">
          <TextInput id="name" label="Name" defaultValue={location?.name ?? ""} className="!mt-0" />
        </div>
        <div className="col-span-2 lg:col-span-1">
          <TextInput id="slug" label="Slug" defaultValue={location?.slug ?? ""} className="!mt-0" />
        </div>
        <div className="col-span-2 lg:col-span-1">
          <TextInput id="address" label="Address" defaultValue={location?.address ?? ""} className="!mt-0" />
        </div>
        <div className="col-span-2 lg:col-span-1">
          <TextInput id="email" inputType="email" label="Email" defaultValue={location?.email ?? ""} className="!mt-0" />
        </div>
        <div className="col-span-2 lg:col-span-1">
          <TextInput id="phone" label="Phone" defaultValue={location?.phone ?? ""} className="!mt-0" />
        </div>
        <div className="col-span-2 lg:col-span-1">
          <TextInput id="website" label="Website" defaultValue={location?.website ?? ""} className="!mt-0" />
        </div>
        <div className="col-span-2 lg:col-span-1">
          <TextInput id="max_capacity" inputType="number" label="Max Capacity" defaultValue={location?.max_capacity ?? ""} className="!mt-0" />
        </div>
        <div className="col-span-2">
          <TextareaInput id="description" label="Description" value={location?.description ?? ""} />
        </div>
        <div className="col-span-2">
          <ImageBasicUploadBlock imageReady={imageReady}
            setImageReady={setImageReady} defaultImage={location?.image ?? ''} />
        </div>
        <div className="col-span-2">
          <ActionButton content="Save" type='submit' name='action' value={location ? 'PUT' : 'POST'} />
        </div>
      </fetcher.Form>
      <div className="flex justify-between mb-4">
        <h2 className="text-2xl font-bold">Prices</h2>
        <IconButton icon='add' type='button' action={() => setShowCreatePrice(true)} className="mt-4" />
      </div>
      <div className="flex flex-col space-y-4">
        {showCreatePrice &&
          priceForm(location?.id)}
        {location?.prices.map((price: any) => {
          return priceForm(location?.id, price);
        })}
      </div>
    </div>;
  }


  return <div className="">
    <div className="max-w-4xl mx-auto">
      <div className="w-full flex justify-between items-center mb-4">
        <H1 className="text-3xl">Locations</H1>
        <IconButton icon='add' type='button' action={() => setShowCreate(!showCreate)} className="mt-4" />
      </div>
      {showCreate &&
        <div className="mt-4 mb-8">
          <h2 className="text-2xl font-bold mb-4">Create Location</h2>
          {locationForm()}
        </div>
      }
      <div className="flex flex-col space-y-4 mb-8">
        {locations.map((location) => {
          return <div key={location.id} className="mb-8 p-4 bg-white dark:bg-gray-2 rounded-lg shadow-md">
            {showEdit.includes(location.id) &&
              locationForm(location)}
            {!showEdit.includes(location.id) &&
              <div className="grid grid-cols-7 gap-4">
                <div className="col-span-7 lg:col-span-2">
                  {location.image &&
                    <img src={location.image} alt="House" className="w-full h-32 object-cover rounded-lg" />
                  }
                </div>
                <div className="col-span-5 lg:col-span-4">
                  <h2 className="text-3xl font-bold">{location.name}</h2>
                  <p className="text-gray-500">{location.address}</p>
                  <p className="text-gray-500">{location.description}</p>
                </div>
                <div className="col-span-1 flex space-y-4 lg:space-y-0 lg:space-x-4 mt-4">
                  <IconButton icon='edit' type='button' action={() => { toggleEdit(location.id) }} />
                  <IconButton icon='decline' type='button' action={() => setShowConfirmModal(location.id.toString())} />
                </div>
              </div>}
          </div>;
        })}
      </div>
    </div>
    <Modal isOpen={!!showConfirmModal} handleClose={() => setShowConfirmModal("")}>
      <AskModalBody message={`Do you really want to delete this location?`}
        primaryButton={{ text: 'Yes', onClick: () => deleteLocation(showConfirmModal) }}
        secondaryButton={{ text: 'No', onClick: () => setShowConfirmModal("") }} />
    </Modal>
    <Modal isOpen={!!showConfirmModalPrice} handleClose={() => setShowConfirmModalPrice("")}>
      <AskModalBody message={`Do you really want to delete this location?`}
        primaryButton={{ text: 'Yes', onClick: () => deleteLocationPrice(showConfirmModalPrice) }}
        secondaryButton={{ text: 'No', onClick: () => setShowConfirmModalPrice("") }} />
    </Modal>
  </div>;
}
