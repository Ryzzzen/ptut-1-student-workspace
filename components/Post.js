import Link from 'next/link';

import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import styles from "./Post.module.css";

export default function Post({ id, title, content, module, authorName, creationTime }) {
  return (
    <article className={styles.article}>
      <div className={styles.module}>
        {module && (
          <Link href={'/posts/by-module/' + module}>
            <a>{module}</a>
          </Link>
        )}
      </div>
      <h2 className={styles.title}>
        <Link href={'/posts/' + id}>
          <a>{title}</a>
        </Link>
      </h2>
      <div className={styles.meta}>
         <span className={styles.author}>
            <span className={styles.avatar}>
               <img src="https://ahrefs.com/blog/wp-content/uploads/2020/09/Tim_ava-425x425.jpg" width="30" height="30" alt={authorName} className={styles.avatarImage} />
            </span>
            {authorName}
         </span>
         <span className={styles.date}>{format(creationTime, 'd MMMM yyyy', { locale: fr })}</span>
      </div>
    </article>
  );
}
