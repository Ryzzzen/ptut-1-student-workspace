import * as defaultStyles from './Title.module.css';
import { useDarkMode } from 'next-dark-mode';

export default function Title({ appendGradient, button, styles = {}, children }) {
  const { darkModeActive } = useDarkMode();

  return (
    <div className={defaultStyles.content}>
      <h1 className={[defaultStyles.title, darkModeActive ? defaultStyles.dark : ''].join(' ')}>
        {children}&nbsp;
        <span className={defaultStyles.gradient}>{appendGradient}</span>
      </h1>
      {button || <></>}
    </div>
  );
};
