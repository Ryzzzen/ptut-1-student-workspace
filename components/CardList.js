import styles from './CardList.module.css';

export default function CardList({ children }) {
  return (
    <div className={styles.list}>
      {children}
    </div>
  );
};
