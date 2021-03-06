import React, { useState, useRef } from 'react';
import Router from 'next/router';

import UserLayout from '../../components/UserLayout';
import Highlight from '../../components/Highlight';
import Title from '../../components/Title';
import Table from '../../components/Table';

import { useToasts } from 'react-toast-notifications';

import { useCurrentClass } from '../../lib/hooks';
import withSession from "../../lib/session";

import Loader from 'react-loader-spinner';

export default function CurrentSchedulePage({ user }) {
  const { data : current } = useCurrentClass();
  let content = <Loader type="Oval" color="var(--color-accent)" height="5em" width="100%" />;

  if (current?.error)
    content = (<Highlight icon="❌" title="Erreur">
      {current.error === 'NOT_FOUND' ? <>
        Vous n'êtes pas en cours actuellement.
        <br />
        Si vous pensez que c'est une erreur, contactez le support.
      </> : current.error}
    </Highlight>);
  else if (current)
  content = (<>
    {current?.students && <Table head={['Nom', 'Prénom', 'Groupe', 'Date. naissance', 'Présent ?']} footer={<i>35 élèves | 1 groupe</i>} fixed={true}>
        {current.students.map((user, index) => <tr id={`${user.userId}`} key={user.userId}>
          <td data-type="lastName">{user.lastName}</td>
          <td data-type="firstName">{user.firstName}</td>
          <td data-type="groupName">{user.groupName}</td>
          <td data-type="birthDate">{user.birthDate ? new Date(user.birthDate).toLocaleDateString() : 'N/D'}</td>
          <td data-type="here">
            <input type="checkbox" />
            Présent
          </td>
        </tr>)}
      </Table>}
    </>);

   return (<UserLayout user={user} flex={true} header={<>
      <Title appendGradient="actuel">
        Votre cours
      </Title>
    </>}>
      {content}
    </UserLayout>);
  };

export const getServerSideProps = withSession(async function ({ req, res }) {
  const user = req.session.get('user');

  if (!user) {
    res.setHeader('location', '/login');
    res.statusCode = 302;
    res.end();
    return { props: {} };
  }

  return {
    props: { user: req.session.get('user') }
  };
});
