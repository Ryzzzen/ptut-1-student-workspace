import * as defaultStyles from './Title.module.css';
import { useDarkMode } from 'next-dark-mode';

export default function Title({ appendGradient, subtitle, button, style = {}, children }) {
  const { darkModeActive } = useDarkMode();

  return (
    <div className={defaultStyles.content} style={style}>
      <h1 className={[defaultStyles.title, darkModeActive ? defaultStyles.dark : ''].join(' ')}>
        {children}&nbsp;
        <span className={defaultStyles.gradient}>{appendGradient}</span>
      </h1>
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        {button || <></>}
        {subtitle && (<span className={defaultStyles.subtitle}>{subtitle}</span>)}
      </div>
    </div>
  );
};
