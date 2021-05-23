import {
  stringToColor,
  pickTextColorBasedOnBgColorAdvanced,
} from "../lib/colors";

import { FormButton } from './FormFields';
import { HiPlusCircle } from "react-icons/hi";

import { format, getDay } from 'date-fns';
import { fr } from 'date-fns/locale';

import { useToasts } from 'react-toast-notifications';
import {
  useContextMenu,
  Submenu,
  Menu,
  Item,
  Separator,
} from "react-contexify";
import "react-contexify/dist/ReactContexify.css";

import styles from "./CalendarBlock.module.css";

export default function CalendarBlock({ user, data }) {
  const { show } = useContextMenu({ id: data.id });
  const { addToast } = useToasts();

  const patch = (key, value) => {
    console.log('[PATCH]', data.id, '->', key, '=', value);

    if (value === null) return;
    fetch(location.protocol + '//' + location.host + `/api/schedule/ade/patch/${data.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ key, value })
    }).then(res => {
      addToast("Cours modifié.", { appearance: 'success' });
      res.text().then(console.dir).catch(console.error);
    }).catch(err => {
      addToast("Une erreur s'est produite lors de l'édition du cours.", { appearance: 'error' });
      console.error(err);
    });
  };


  function handleItemClick({ event, props, triggerEvent }) {
    switch (event.currentTarget.id) {
      case "notify": {
          let title = window.prompt('Saisissez le titre de la notification', 'Rappel de cours');
          let body = window.prompt('Saisissez le corps de la notification', data?.subject || data.summary);

          fetch(location.protocol + '//' + location.host + `/api/notifications/broadcast?title=${title}&body=${body}&interests=${document.querySelector('[interests]').getAttribute('interests')}`)
          .then(() => addToast('Tous les utilisateurs concernés ont été notifiés.', { appearance: 'success' }))
          .catch(err => {
            addToast("Une erreur s'est produite.", { appearance: 'error' });
            console.error(err);
          });

          break;
      }
      case "connect": {
        window.open(data.meeting, '_blank').focus();
        break;
      }
      case "details": {
        alert(`${data?.module || ''} ${data?.subject || data.summary}\n${data.start.toLocaleString()} au ${data.end.toLocaleString()}\n${data.description}\n${data.location}`);
        break;
      }
      case "change-subject": {
        patch('subject', window.prompt('Saisissez le titre du cours', data?.subject || data.summary));
        break;
      }
      case "change-module": {
        patch('module', window.prompt('Saisissez le module du cours', data?.module || ''));
        break;
      }
      case "change-description": {
        patch('description', window.prompt('Saisissez la description du cours', data.description));
        break;
      }
      case "change-meeting": {
        patch('meeting', window.prompt('Saisissez le lien de la réunion'));
        break;
      }
      case "change-room": {
        patch('location', window.prompt('Saisissez le lieu de la réunion', data.location));
        break;
      }
      case "remove": {
        patch('hidden', confirm('Voulez-vous supprimer ce cours?') ? 1 : 0);
        break;
      }
    }
  }

  return (
    <>
      <Menu id={data.id}>
        <Item id="connect" onClick={handleItemClick} disabled={typeof data.meeting === 'undefined'}>
          &#x1F4BB;&nbsp;Se connecter à la réunion
        </Item>
        <Item id="details" onClick={handleItemClick}>
          ℹ️&nbsp;Détails
        </Item>
        <Separator hidden={user.userType === 0 && user.delegate === false} />
        <Submenu label="Edition&nbsp;" hidden={user.userType === 0 && user.delegate === false}>
          <Item id="change-subject" onClick={handleItemClick}>
            🖍️&nbsp;Titre
          </Item>
          <Item id="change-module" onClick={handleItemClick}>
            📚&nbsp;Module
          </Item>
          <Item id="change-description" onClick={handleItemClick}>
            💬&nbsp;Description
          </Item>
          <Item id="change-meeting" onClick={handleItemClick}>
            💻&nbsp;Réunion
          </Item>
          <Item id="change-room" onClick={handleItemClick}>
            🚪&nbsp;Salle
          </Item>
        </Submenu>
        <Submenu label="Modération&nbsp;" hidden={user.userType === 0 && user.delegate === false}>
          <Item id="notify" onClick={handleItemClick}>
            🔔&nbsp;Notifier le groupe
          </Item>
          <Separator />
          <Item id="remove" onClick={handleItemClick}>
            ❌&nbsp;Supprimer le cours
          </Item>
        </Submenu>
      </Menu>
      <div
        onClick={() => {
          if  (window.matchMedia('screen and (max-width: 900px)').matches) return;
          if (!data.meeting) addToast("Ce cours n'a pas de réunion associée.", { appearance: 'error' });
          else if (confirm(`Vous allez rejoindre la réunion du cours: "${data.summary}"`))  window.open(data.meeting, '_blank').focus();
        }}
        onContextMenu={(event) => show(event, { props: {} })}
        className={styles.session}
        style={{
          gridColumn: "track-" + getDay(data.start),
          backgroundColor: stringToColor(data.summary),
          color: pickTextColorBasedOnBgColorAdvanced(
            stringToColor(data.summary),
            "white",
            "black"
          ),
          gridRow:
            "time-" +
            data.start.toLocaleTimeString().slice(0, 5).replace(":", "") +
            " / time-" +
            data.end.toLocaleTimeString().slice(0, 5).replace(":", ""),
        }}
      >
        <div className={styles.hour}>
          <span className={styles.date}>
            <FormButton is="circle" className={styles.contextMenuButton} onClick={(event) => show(event, { props: {} })}>
              ✨
            </FormButton>
            {format(data.start, 'eeee dd MMMM', { locale: fr })} de&nbsp;
          </span>
          {data.start.toLocaleTimeString().slice(0, 5)}{' à '}
          {data.end.toLocaleTimeString().slice(0, 5)}
        </div>

        <p className={styles.name}>
          {data?.module && data.module} {data?.subject || data.summary} {data?.type && `(${data?.type})`}
        </p>
        <p className={styles.teacher}>{data.description}</p>

        <div className={styles.bottom}>
          <p>{data.location}</p>
        </div>
      </div>
    </>
  );
}
