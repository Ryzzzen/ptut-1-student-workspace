import Link from 'next/link';

import UserLayout from '../../components/UserLayout';
import GroupList from '../../components/GroupList';

import Schedule from '../../components/Schedule';

import { useSchedule } from '../../lib/hooks';
import withSession from "../../lib/session";

import { lightFormat, getDay } from 'date-fns';

export default function SchedulePage({ user }) {
  const { data : schedule } = useSchedule(user);

  let content = <h2 className={'title'}>Chargement</h2>;
  let data = (schedule || []).map(x => {
    let start = new Date(x.start);
    return {
      id: x.id,
      day: getDay(start),
      start: lightFormat(start, 'HHmm'),
      end: lightFormat(new Date(start.getTime() + x.duration * 60000), 'HHmm'),
      module: x.module,
      name: x.subjectName,
      room: x.room,
      groupId: x.groupId,
      groupName: x.groupName,
      color: x.color,
      teacher: x.teacherFirstName + ' ' + x.teacherLastName,
      meetingUrl: x?.meetingUrl
    };
  });

  if (user) content = <Schedule data={data} />

  return (
    <UserLayout user={user} flex={true}>
      <div className={'grid'} style={{ width: '100%', margin: '0' }}>
        {content}
      </div>
    </UserLayout>
  );
};

export const getServerSideProps = withSession(async function ({ req, res }) {
  const user = req.session.get('user');

  if (!user) {
    res.setHeader('location', '/login');
    res.statusCode = 302;
    res.end();
    return { props: {} };
  }

  return {
    props: { user: req.session.get('user') },
  };
});
