import Router from 'next/router';
import Link from '../components/Link';

import BasicLayout from '../components/BasicLayout';

import Form from "../components/Form";
import * as Fields from "../components/FormFields";

import { useDarkMode } from 'next-dark-mode';
import { useToasts } from 'react-toast-notifications';

import withSession from "../lib/session";

export default function LoginPage(props) {
  const { darkModeActive } = useDarkMode();
  const { addToast } = useToasts();

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(location.protocol + '//' + location.host + '/api/me/login', {
        body: JSON.stringify({
          email: e.target.email.value,
          password: e.target.password.value
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST'
      });

      const result = await res.json();
      console.dir(result);

      if (result.success) {
        addToast('Connexion réussie', { appearance: 'success' });
        Router.push('/dashboard');
      }
      else addToast(result.error || 'Une erreur s\'est produite', { appearance: 'error' });
    }
    catch(error) {
      console.error(error);
      addToast(error || 'Une erreur s\'est produite', { appearance: 'error' });
    }
  }

  return (<div className={'bgLogo'}>
    <style global jsx>{`
      @font-face {
        font-family: Marianne;
        src: url(/assets/login/marianne-bold-webfont.ttf);
      }

      @font-face {
        font-family: Segoe;
        src: url(/assets/login/seguibl.ttf);
      }

      body {
        background: #${darkModeActive ? '282828' : 'EBEBEB'};
        background-image: url(/assets/login/bg-1.webp), url(/assets/login/bg-1.png);
        background-repeat: no-repeat;
        background-size: cover;
        overflow: hidden;

        font-family: 'Segoe UI', 'Segoe';
        font-weight: bolder;
      }

      @media (max-width: 600px) {
        body {
          background-position: center;
        }
      }

      .bgLogo {
        height: 100vh;
        width: 100vw;
        background-image: url(/assets/login/bg-overlay.webp), url(/assets/login/bg-overlay.png);
        background-repeat: no-repeat;
        background-position: center;
        background-size: 100%;
        padding-bottom: 12.5%;
      }

      @media (max-width: 600px) {
        .bgLogo {
          background-position: center;
          background-size: 100%;
        }
      }

      h3 {
        margin: 1em 0 0 0;
        padding-bottom: 0;
        color: #${darkModeActive ? 'DCDCDC' : '282828'} !important;
        font-size: 3.125em;
        text-align: center;
        text-transform: uppercase;

        font-weight: bolder;
      }

      @media (max-width: 600px) {
        h3 {
          margin-top: 1.5em;
          font-size: 1.875em;
        }
      }

      p {
        margin: 0;

        text-align: center;
        color: #0098FF;
        
        font-size: 2.5em;
        font-weight: bolder;

        text-transform: uppercase;
      }

      @media (max-width: 600px) {
        p {
          font-size: 1.5625em;
        }
      }

      form {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;

        margin: auto auto;

        width: 100%;
        height: 50vh;
      }

      form label {
        color: #${darkModeActive ? 'DCDCDC' : '282828'} !important;

        font-family: 'Marianne', 'Segoe UI', 'Segoe';
        font-weight: bolder;
        font-size: large;

        text-transform: uppercase;

        width: 100%;
        display: block;
      }

      form > div {
        width: 60% !important;
      }

      button {
        padding: 1em 2em !important;
      }

      form > div > div {
        margin: 0 !important;
      }

      input {
        outline: 0;
        border: none;

        width: 100%;
        padding: 1.5% 2%;

        border-radius: 0.7em;

        transition: color 0.5s, background-color 0.5s;
      }

      input[type="text"],
      input[type="email"],
      input[type="password"] {
        display: inline-block;

        box-sizing: border-box;
        background-color: #282828;
        opacity: ${darkModeActive ? 0.3 : 0.2};
        font-family: monospace;
        font-size: large;
        color: white;
      }

      button {
        font-size: 1.15rem;
      }

      button:hover {
        transform: scale(1.1, 1.1);
      }

      @media (max-width: 600px) {
        button {
          padding: 3%;
          font-size: 0.93em;
        }
      }

      a {
      	margin: 0%;
      	padding-bottom: 0%;
      	font-family: 'Segoe UI', 'Segoe';
        color: #${darkModeActive ? 'DCDCDC' : '282828'};
      	font-size: 1.125em;
      	text-align: center;
        text-transform: uppercase;
      }

      @media (max-width: 600px) {
      	a {
      		font-size: 0.81em;
      	}
      }
    `}</style>
    <BasicLayout title="SWS -> Connexion">
      <h3>Student Workspace</h3>
      <p>Connexion</p>
      <Form onSubmit={onSubmit}>
        <Fields.FormInput disableStyle={true} label="Adresse mail" id="email" name="email" type="email" placeholder="exemple@exemple.fr" />
        <Fields.FormInput disableStyle={true} label="Mot de passe" id="password" name="password" type="password" placeholder="Mot de passe difficile à trouver" />
        <Fields.FormButton type="submit" is="light">Se connecter</Fields.FormButton>
      </Form>
    </BasicLayout>
  </div>);
};

export const getServerSideProps = withSession(async function ({ req, res }) {
  if (req.session.get('user')) {
    res.setHeader('location', '/dashboard');
    res.statusCode = 302;
    res.end();
  }

  return { props: {} };
});
