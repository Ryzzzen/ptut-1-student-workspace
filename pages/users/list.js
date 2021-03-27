import { useRouter } from 'next/router';
import Link from '../../components/Link';

import {
  contextMenu,
  Menu,
  Item,
  Separator,
  Submenu
} from "react-contexify";

import UserLayout from '../../components/UserLayout';
import Highlight from "../../components/Highlight";
import Table from '../../components/Table';
import Title from '../../components/Title';

import Button from '../../components/FormFields/FormButton';
import { HiPlusCircle } from "react-icons/hi";

import use from '../../lib/use';
import withSession from "../../lib/session";

import { useToasts } from 'react-toast-notifications';

export default function UserListPage({ user, module }) {
  const { data: users, setSize, size } = use({ url: '/api/users/list', infinite: true });
  const { addToast } = useToasts();
  const router = useRouter();

  const displayMenu = e => contextMenu.show({
    id: "userTable",
    event: e,
    props: { id: e.currentTarget.id }
  });

  function handleItemClick({ event, props, data, triggerEvent }) {
    switch (event.currentTarget.id) {
      case "edit":
        router.push('/users/edit?id=' + props.id);
        break;
      case "notes":
        router.push('/grades/list?id=' + props.id);
        break;
      case "remove":
        if (!confirm('Voulez-vous vraiment supprimer cet utilisateur?'))
          return;

        fetcher(location.protocol + '//' + location.host + '/api/users/' + props.id, { method: 'DELETE' })
        .then(() => addToast(`Suppression réussie de l'utilisateur #${props.id}`, { appearance: 'success' }))
        .catch(err => {
          addToast("Une erreur s'est produite.", { appearance: 'error' });
          console.error(err);
        });
        break;
    }
  }

  let content;

  if (!users) content = <h2 className={'title'}>Chargement</h2>;
  else {
    content = <>
      <Table head={['#', 'Nom', 'Prénom', 'E-mail', 'Groupe', 'Type']} menuId="userTable" onContextMenu={displayMenu} menu={<Menu id="userTable">
        <Item id="edit" onClick={handleItemClick}>📝 Editer </Item>
        <Item id="notes" onClick={handleItemClick}>📑 Voir les notes</Item>
        <Separator />
        <Item id="remove" onClick={handleItemClick}>&#x274C; Supprimer</Item>
      </Menu>}>
        {[].concat(...users).map((user, index) => <tr id={`${user.userId}`} key={user.userId}>
          <td data-type="id">{user.userId}</td>
          <td data-type="lastName">{user.lastName}</td>
          <td data-type="firstName">{user.firstName}</td>
          <td data-type="email">{user.email}</td>
          <td data-type="groupName">{user.group.name}</td>
          <td data-type="type">{user.userType === 0 ? 'Étudiant' : user.userType === 1 ? 'Professeur' : 'Administration'}</td>
        </tr>)}
      </Table>
      <Button onClick={() => setSize(size + 1)}>Charger plus...</Button>
    </>;
  }

  return (
    <UserLayout user={user} flex={true} header={<>
      <Title appendGradient="enregistrés" button={user.userType == 2 ?
        <Link href="/users/edit">
          <Button is="action" icon={<HiPlusCircle />}>Ajouter</Button>
        </Link> : <></>}>
        Modules
      </Title>
      </>}>
      <Highlight title="Le saviez-vous?">
        Cliquez sur un utilisateur pour éditer des propriétés.
      </Highlight>
      {content}
    </UserLayout>
  );
};

export const getServerSideProps = withSession(async function ({ req, res, query }) {
  const user = req.session.get('user');

  if (!user || user.userType != 2) {
    res.setHeader('location', '/login');
    res.statusCode = 302;
    res.end();
    return { props: {} };
  }

  return {
    props: { user: req.session.get('user'), ...query },
  };
});
