import { useContactActions } from './useContactActions';
import { AddContactExportData, ContactEvents, ContactsDatabaseLimits } from '@typings/contact';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import qs from 'qs';
import { useApps } from '@os/apps/hooks/useApps';
import { useNuiEvent } from '@common/hooks/useNuiEvent';

export const useContactsListener = () => {
  const { getContactByNumber } = useContactActions();
  const navigate = useNavigate();
  const { getApp } = useApps();

  const addContactExportHandler = useCallback(
    (contactData: AddContactExportData) => {
      const contact = getContactByNumber(contactData.number);
      const { path } = getApp('CONTACTS');

      const queryData = qs.stringify({
        addNumber: contactData.number.slice(0, ContactsDatabaseLimits.number),
        name: contactData.name?.slice(0, ContactsDatabaseLimits.display),
        avatar: contactData.avatar?.slice(0, ContactsDatabaseLimits.avatar),
      });

      if (!contact) {
        return navigate({
          pathname: `${path}/-1`,
          search: `?${queryData}`,
        });
      }

      navigate({
        pathname: `${path}/${contact.id}`,
        search: `?${queryData}`,
      });
    },
    [getApp, getContactByNumber, navigate],
  );

  useNuiEvent<AddContactExportData>(
    'CONTACTS',
    ContactEvents.ADD_CONTACT_EXPORT,
    addContactExportHandler,
  );
};
