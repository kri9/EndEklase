import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import 'react-big-calendar/lib/css/react-big-calendar.css';
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import { addHours } from 'date-fns'
import startOfWeek from 'date-fns/startOfWeek'
import getDay from 'date-fns/getDay'
import enUS from 'date-fns/locale/en-US'
import { useEffect, useState } from 'react'
import { getLessons } from 'src/api'
import { LessonDTO } from 'src/common/interfaces'

const locales = {
  'en-US': enUS,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

interface CalendarLessonDTO extends LessonDTO {
  start: Date;
  end: Date;
  title: string;
}



export function LessonsTab() {
  const [lessons, setLessons] = useState<LessonDTO[]>([]);
  useEffect(() => {
    getLessons().then((lessons: LessonDTO[]) => {
      setLessons(lessons.map((l: LessonDTO): CalendarLessonDTO => ({
        ...l,
        start: new Date(l.date),
        end: addHours(new Date(l.date), 1),
        title: `${l.topic} (${l.groupName}, ${l.kindergartenName})`
      })))
    })
  }, [])
  return (<>
    <Calendar
      localizer={localizer}
      events={lessons}
      style={{ height: 750 }}
    />

  </>)
}
