import React, { useState, useEffect } from 'react';

/*
* Voir pour importer ces fonts par page ou composant, car là on les importe dans toute les pages alors
* qu'elles ne sont pas forcément utilisées partout
*/
import Sidebar from './Sidebar';
import Searchbar from './Searchbar';

import styles from './UserLayout.module.css';

import Gravatar from 'react-gravatar';
import { HiAdjustments, HiLogout, HiArrowRight, HiDotsHorizontal, HiMoon, HiSun, HiColorSwatch } from "react-icons/hi";

import Loader from 'react-loader-spinner';

import { useTheme } from 'next-themes';
import { parseISO, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

import Button from './FormFields/FormButton';

import Link from './Link';
import Card from './Card';

const isServer = () => typeof window === `undefined`;

import { useADE, getClasses, getCurrentCourse } from '../lib/ade';
import { useCurrentClass } from '../lib/hooks';

export default function UserLayout({ title, user, children, header, flex = true, year, ...rest }) {
  const { theme, setTheme } = useTheme();

  const [current, setCurrentCourse] = useState(getCurrentCourse());
  const { data : currentSWS } = useCurrentClass();

  useEffect(() => {
    if (currentSWS && !currentSWS.error) setCurrentCourse(current);
    console.dir(currentSWS);
  }, [currentSWS]);

  useEffect(() => {
    console.dir(current);
  }, [current]);

  if (!isServer()) useEffect(() => useADE(user, user?.school, user?.degree, year || user?.year), [user, year]);

  return (<>
    <main className={styles.main} {...rest}>
      <Sidebar user={user}></Sidebar>

      <section className={styles.content}>
        <header className={styles.header}>
          <div className={styles.content}>
            <Searchbar />
            {header || <></>}
          </div>
        </header>
        {children}
      </section>

      <aside className={styles['cards-list']}>
        <Card className={styles.card}>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%' }}>
            {!user?.isLoggedIn ? <Loader type="Oval" color="var(--color-accent)" style={{ margin: 'auto auto' }} width="100%" /> : (
              <div className={styles.text}>
                <span className={styles.name}>{user.firstName} {user.lastName}</span>
                <span className={styles.id}>
                  {user.userType === 0 && user.delegate === false && 'Étudiant'}
                  {user.userType === 0 && user.delegate === true && 'Délégué'}
                  {user.userType === 1 && 'Professeur'}
                  {user.userType === 2 && 'Administration'}
                </span>
                <span className={styles.id}>#{user.userId}</span>
              </div>)}
            {user?.isLoggedIn && <Gravatar size={80} email={user.email} alt="Votre photo de profil" className={styles.avatar} draggable={false} />}
          </div>
          <Button style={{ marginTop: '1em' }} icon={theme === 'light' ? <HiSun /> : <HiMoon />} onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            {theme === 'light' ? <span>Clair</span> : <span>Sombre</span>}
          </Button>
        </Card>

        {current && current.teacher && ( /* SWS */
          <Card className={[styles.card, styles.currentClass].join(' ')}>
            <p className={styles.text}>
              <span className={styles.title}>{current.subject.module} {current.subject.name}</span>
              <span className={styles.subtitle}>{current.teacher.firstName} {current.teacher.lastName}</span>
              <span className={styles.subtitle} style={{ color: 'var(--color-accent)' }}>Démarré {formatDistanceToNow(parseISO(current.start), { addSuffix: true, locale: fr })}</span>
            </p>

            <div className="buttons">
              <Button is="danger" icon={<HiMoon />} onClick={() => confirm('(WIP) Se déclarer absent ?')}>Absent ?</Button>
              {current.meetingUrl && (
                <Link href={current.meetingUrl} target="_blank">
                  <Button is="success" icon={<HiArrowRight />}>Rejoindre</Button>
                </Link>
              )}

              <Link href="/schedule/current">
                <Button icon={<HiDotsHorizontal />}>Voir</Button>
              </Link>
            </div>
          </Card>
        )}

        {current && current.summary && ( /* ADE */
          <Card className={[styles.card, styles.currentClass].join(' ')}>
            <p className={styles.text}>
              <span className={styles.title}>{current.summary}</span>
              <span className={styles.subtitle}><i>{current.description.split(' ').slice(1).join(' ').replace(/(\r\n|\n|\r)/gm, '\n').replace(/\s*\(.*?\)\s*/g, '').trim()}</i></span>
              <span className={styles.subtitle}><b>{current.location}</b></span>
              <span className={styles.subtitle} style={{ color: 'var(--color-accent)' }}>Démarré {formatDistanceToNow(current.start, { addSuffix: true, locale: fr })}</span>
            </p>

            <div className="buttons">
              <Button icon={<HiDotsHorizontal />}>Voir</Button>
              <Button is="success" icon={<HiArrowRight />} disabled={typeof current.meetingUrl === 'undefined'}>Rejoindre</Button>
            </div>
          </Card>
        )}

        <Card className={[styles.card, styles.actions].join(' ')}>
          <p className={styles.text}>
            <span className={styles.title}>Actions</span>
            <span className={styles.subtitle}>Que souhaitez-vous faire ?</span>
          </p>

          <div className="buttons">
            <Link href="/settings">
              <Button icon={<HiAdjustments />}>Paramètres</Button>
            </Link>

            <Link href="/logout">
              <Button is="danger" icon={<HiLogout />}></Button>
            </Link>
          </div>
        </Card>
      </aside>
    </main>
  </>);
};
