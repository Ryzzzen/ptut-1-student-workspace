import withSession from "../../../lib/session";
import { query } from '../../../lib/db';
import { isFuture, isWithinInterval, addMinutes } from 'date-fns';

async function handler(req, res, session) {
  if (!req?.session?.get('user')) return res.status(401).send({ error: 'NOT_AUTHORIZED', success: false });

  try {
    let schedule = await query(
      `
      SELECT schedule.id, start, duration, subjectId, room, schedule.groupId, meetingUrl, subjects.module, subjects.name as subjectName, color as moduleColor, firstName AS teacherFirstName, lastName as teacherLastName, email as teacherEmail, schedule.teacherId, groups.name as groupName FROM schedule
      INNER JOIN users ON teacherId = users.userId
      INNER JOIN subjects ON subjectId = subjects.id
      LEFT OUTER JOIN groups ON schedule.groupId = groups.id
      ORDER BY start ASC
    `);

    schedule = schedule.map(o => ({
      id: `${o.start}-${o.subjectId}-${o.teacherId}`,
      start: new Date(o.start * 1000),
      end: addMinutes(new Date(o.start * 1000), o.duration),
      duration: o.duration,
      subject: { id: o.subjectId, name: o.subjectName, module: o.module, color: o.color ? '#' + o.color : null },
      teacher: { firstName: o.teacherFirstName, lastName: o.teacherLastName, email: o.teacherEmail, id: o.teacherId },
      meetingUrl: o.meetingUrl,
      groups: [{ id: o.groupId, name: o.groupName }],
      room: o.room
    }));

    let results = {};
    for (let block of schedule) {
      if (results[block.id]) results[block.id].groups.push(block.groups[0]);
      else results[block.id] = block;
    }

    let current = Object.values(results)
    .filter(x => x.groups.find(g => g.id === req.session.get('user').group.id))
    .filter(x => isWithinInterval(new Date(), {
      start: x.start,
      end: x.end
    }));

    if (current[0] && req.session.get('user').userType !== 0) {
      current[0].students = await query(
        `
        SELECT userId, email, birthDate, firstName, lastName, groups.name as groupName, groupId FROM users
        LEFT OUTER JOIN groups ON groups.id = users.groupId
        WHERE ${current[0].groups.map(x => 'groupId = ?').join(' OR ')}
      `, [...current[0].groups.map(x => x.id)]);
    }

    if (current[0]) res.send(current[0]);
    else res.send('');
  }
  catch (e) {
    res.status(500).json({ error: 'FATAL', message: e.message, success: false });
  }
}

export default withSession(handler);
