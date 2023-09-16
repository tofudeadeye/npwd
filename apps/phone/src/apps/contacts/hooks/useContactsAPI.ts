import { useCallback } from 'react';
import { useSnackbar } from '@os/snackbar/hooks/useSnackbar';
import fetchNui from '@utils/fetchNui';
import { ServerPromiseResp } from '@typings/common';
import { Contact, ContactEvents, PreDBContact, ContactPay } from '@typings/contact';
import { useTranslation } from 'react-i18next';
import { useContactActions } from './useContactActions';
import { useNavigate } from 'react-router-dom';

export const useContactsAPI = () => {
  const { addAlert } = useSnackbar();
  const [t] = useTranslation();
  const { addLocalContact, updateLocalContact, deleteLocalContact } = useContactActions();
  const navigate = useNavigate();

  const payContact = useCallback(
    ({ number, amount }: ContactPay) => {
      fetchNui<ServerPromiseResp<ContactPay>>(ContactEvents.PAY_CONTACT, { number, amount }).then(
        (resp) => {
          if (resp.status !== 'ok') {
            return addAlert({ message: t('CONTACTS.FEEDBACK.PAYMENTFAILED'), type: 'error' });
          }
          addAlert({ message: t('CONTACTS.FEEDBACK.PAYMENTSENT'), type: 'success' });
        },
      );
    },
    [addAlert, t],
  );

  const addNewContact = useCallback(
    ({ display, number, avatar }: PreDBContact, referral: string) => {
      fetchNui<ServerPromiseResp<Contact>>(ContactEvents.ADD_CONTACT, {
        display,
        number,
        avatar,
      }).then((serverResp) => {
        if (serverResp.status !== 'ok') {
          return addAlert({
            message: t(serverResp.errorMsg),
            type: 'error',
          });
        }

        // Sanity checks maybe?
        addLocalContact(serverResp.data);
        addAlert({
          message: t('CONTACTS.FEEDBACK.ADD_SUCCESS'),
          type: 'success',
        });
        navigate(referral, {
          replace: true,
        });
      });
    },
    [addAlert, addLocalContact, navigate, t],
  );

  const updateContact = useCallback(
    ({ id, display, number, avatar }: Contact) => {
      fetchNui<ServerPromiseResp>(ContactEvents.UPDATE_CONTACT, {
        id,
        display,
        number,
        avatar,
      }).then((resp) => {
        if (resp.status !== 'ok') {
          return addAlert({
            message: t(resp.errorMsg),
            type: 'error',
          });
        }

        updateLocalContact({
          id,
          display,
          number,
          avatar,
        });

        addAlert({
          message: t('CONTACTS.FEEDBACK.UPDATE_SUCCESS'),
          type: 'success',
        });

        navigate(-1);
      });
    },
    [addAlert, navigate, t, updateLocalContact],
  );

  const deleteContact = useCallback(
    ({ id }) => {
      fetchNui<ServerPromiseResp>(ContactEvents.DELETE_CONTACT, { id }).then((resp) => {
        if (resp.status !== 'ok') {
          return addAlert({
            message: t('CONTACTS.FEEDBACK.DELETE_FAILED'),
            type: 'error',
          });
        }
        navigate(-1);

        deleteLocalContact(id);

        addAlert({
          message: t('CONTACTS.FEEDBACK.DELETE_SUCCESS'),
          type: 'success',
        });
      });
    },
    [addAlert, deleteLocalContact, navigate, t],
  );

  return { addNewContact, updateContact, deleteContact, payContact };
};
