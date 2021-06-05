import React, { useEffect, useState } from 'react';

import {
  stringToColor,
  pickTextColorBasedOnBgColorAdvanced,
} from "../lib/colors";

import { parseCalendar } from '../lib/ade';

import { FormButton } from './FormFields';
import { HiPlusCircle } from "react-icons/hi";

import { format, parse, getDay, isBefore, set } from 'date-fns';
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

export default function CalendarBlock({ user, resource, settings, data }) {
  const { show } = useContextMenu({ id: data.id });
  const { addToast } = useToasts();

  const patch = (key, value, bulk = false) => {
    if (!value || value === '') return addToast('Opération annulée', { appearance: 'warning' });

    console.log('[PATCH]', data.id, '->', key, '=', value);

    if (value === null) return;
    return fetch(location.protocol + '//' + location.host + `/api/schedule/ade/patch/${data.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value })
    }).then(res => {
      addToast("Cours modifié. Rechargez pour voir les changements.", { appearance: 'success' });
    }).catch(err => {
      addToast("Une erreur s'est produite lors de l'édition du cours.", { appearance: 'error' });
      console.error(err);
    });
  };

  const bulkPatch = (ids, key, value) => {
    if (!value || value === '') return addToast('Opération annulée', { appearance: 'warning' });

    return fetch(location.protocol + '//' + location.host + `/api/schedule/ade/patch-bulk`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ids.map(id => ({ id, key, value })))
    }).then(res => {
      addToast(ids.length + ' cours modifiés. Rechargez pour voir les changements.', { appearance: 'success' });
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
      case "change-date": {
        let q = window.prompt('Saisissez la nouvelle date (format jour/mois)', format(data.start, 'dd/MM'));
        if (!q || q === '') return addToast('Opération annulée', { appearance: 'warning' });

        try {
          let start = parse(q, 'dd/MM', data.start);
          start = set(start, { hours: data.start.getHours(), minutes: data.start.getMinutes() });

          let end = parse(q, 'dd/MM', data.end);
          end = set(end, { hours: data.end.getHours(), minutes: data.end.getMinutes() });

          if (isNaN(start.getTime()) || isNaN(end.getTime())) throw Error({ message: 'La date entrée est invalide' });

          patch('start', start);
          patch('end', end);
        }
        catch(error) {
          console.error(error);
          return addToast('Erreur' + error.message ? ': ' + error.message : '', { appearance: 'error' });
        }

        break;
      }
      case "change-hours": {
        let q1 = window.prompt("Saisissez l'heure du début", format(data.start, 'HH:mm'));
        let q2 = window.prompt("Saisissez l'heure de fin", format(data.end, 'HH:mm'));

        if (!q1 || q1 === '' || !q2 || q2 === '') return addToast('Opération annulée', { appearance: 'warning' });

        try {
          let start = parse(q1, 'HH:mm', data.start);
          let end = parse(q2, 'HH:mm', data.end);

          if (isNaN(start.getTime()) || isNaN(end.getTime())) throw Error({ message: 'L\'heure donnée est invalide' });

          patch('start', start);
          patch('end', end);
        }
        catch(error) {
          console.error(error);
          return addToast('Erreur' + error.message ? ': ' + error.message : '', { appearance: 'error' });
        }

        break;
      }
      case "change-meeting": {
        patch('meeting', window.prompt('Saisissez le lien de la réunion'));
        break;
      }
      case "change-meeting-by-module": {
        const q = window.prompt('Saisissez le lien de la réunion');

        const ids = parseCalendar({ user, resource }).filter(e => e?.module === data?.module && !isBefore(e.start, data.start)).map(e => e.id);
        bulkPatch(ids, 'meeting', q);
        break;
      }
      case "change-room": {
        patch('location', window.prompt('Saisissez le lieu de la réunion', data.location));
        break;
      }
      case "change-room-to-remote": {
        patch('location', '$_REMOTE');
        break;
      }
      case "hide": {
        patch('hidden', confirm('Voulez-vous cacher ce cours pour tout le monde?') ? 1 : 0);
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
          <Item id="change-date" onClick={handleItemClick}>
            ⏰&nbsp;Date
          </Item>
          {/*
            <Submenu label="⏰ Date">
              <Item id="change-hours" onClick={handleItemClick}>
                ⏰&nbsp;Heure
              </Item>
              <Item id="change-datetime" onClick={handleItemClick}>
                ⏰&nbsp;Les deux
              </Item>
            </Submenu>
            */}
          <Submenu label="💻 Réunion">
            <Item id="change-meeting" onClick={handleItemClick}>
              Pour ce cours
            </Item>
            <Item id="change-meeting-by-module" onClick={handleItemClick} disabled={data.module === undefined}>
              Pour ce module entier
            </Item>
          </Submenu>
          <Submenu label="🚪 Lieu">
            <Item id="change-room" onClick={handleItemClick}>
              Présentiel (et changer la salle)
            </Item>
            <Item id="change-room-to-remote" onClick={handleItemClick}>
              Distanciel
            </Item>
          </Submenu>
        </Submenu>
        <Submenu label="Modération&nbsp;" hidden={user.userType === 0 && user.delegate === false}>
          <Item id="notify" onClick={handleItemClick}>
            🔔&nbsp;Notifier le groupe
          </Item>
          <Separator />
          <Item id="hide" onClick={handleItemClick}>
            ❌&nbsp;Cacher le cours
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
          gridColumn: "track-" + getDay(data.end),
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
          {data.start.toLocaleTimeString().slice(0, 5)}{' à '}{data.end.toLocaleTimeString().slice(0, 5)}
        </div>

        <p className={styles.name}>
          {data.type ? <>{data.type} {settings.showModule && data.module}<br /></> : ''}
          {data?.subject || data.summary}
        </p>

        {settings.showTeachers && <p className={styles.teacher}>{data.description}</p>}

        <div className={styles.bottom}>
          {(data.meeting || data.location === '$_REMOTE' || data.type === 'CM' && !data.location) && <p>🌐 Distanciel</p>}
          {data.location && data.location !== '$_REMOTE' && <p>🏫 {data.location}</p>}
        </div>
      </div>
    </>
  );
}
