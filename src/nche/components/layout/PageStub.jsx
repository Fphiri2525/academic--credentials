import styles from './PageStub.module.css';

export default function PageStub({ title, description }) {
  return (
    <div className={styles.stub}>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.text}>{description}</p>
    </div>
  );
}