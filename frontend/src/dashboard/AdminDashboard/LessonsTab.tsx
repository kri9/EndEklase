import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import format from "date-fns/format";
import parse from "date-fns/parse";
import { addHours, isSameDay, subDays } from "date-fns";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";
import { useEffect, useState } from "react";
import { getLessons, getRequest } from "src/api";
import { LessonDTO } from "src/common/interfaces";
import Modal from "src/common/Modal";
import { LessonEditForm } from "./forms/LessonEditForm";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarLessonDTO extends LessonDTO {
  start: Date;
  end: Date;
  title: string;
}

const calendarLessonMapper = (l: LessonDTO): CalendarLessonDTO => ({
  ...l,
  start: new Date(l.date),
  end: addHours(new Date(l.date), 1),
  title: `${l.topic} (${l.groupName}, ${l.kindergartenName})`,
});

function isBadLesson(lesson: CalendarLessonDTO) {
  const yesterday = subDays(new Date(), 1);
  return isSameDay(yesterday, lesson.start) && lesson.numOfAttendees === 0;
}

export function LessonsTab() {
  const [lessons, setLessons] = useState<CalendarLessonDTO[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<LessonDTO | null>(null);
  useEffect(() => {
    getLessons().then((lessons: LessonDTO[]) => {
      setLessons(
        lessons.map(calendarLessonMapper).filter((l) => !isBadLesson(l)),
      );
    });
  }, []);
  return (
    <>
      <Modal
        isOpen={selectedLesson != null}
        onClose={() => {
          getRequest<LessonDTO>(`admin/lesson/${selectedLesson!.id}`)
            .then(calendarLessonMapper)
            .then((fl) =>
              setLessons(lessons.map((l) => (l.id === fl.id ? fl : l))),
            );
          setSelectedLesson(null);
        }}
      >
        <LessonEditForm lesson={selectedLesson!} />
      </Modal>
      <Calendar
        popup
        localizer={localizer}
        events={lessons}
        style={{ height: 750 }}
        onSelectEvent={(l) => !l.isLockedForEditing && setSelectedLesson(l)}
        eventPropGetter={(event) => ({
          className: event.isLockedForEditing ? "!bg-gray-400" : "",
        })}
      />
    </>
  );
}
