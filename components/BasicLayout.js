import Head from 'next/head';
import Link from 'next/link';

import styles from './BasicLayout.module.css';

export default function BasicLayout({ title, children }) {
  return (
    <div className={styles.container}>
      <Head>
        <title>{title || 'Remote Toolbox'}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {children}
      </main>

      <footer className={styles.footer}>
        <p>
          <b>Remote Toolbox</b> — Votre nouvel environnement de travail
        </p>
      </footer>
    </div>
  );
};
