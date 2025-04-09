import { LessonDTO } from "src/common/interfaces";
import RootObjectForm from "../common/RootObjectForm";
import { useState } from "react";
import TextInput from "../common/TextInput";
import DateInput from "../common/DateInput";
import { putRequest } from "src/api";


export function LessonEditForm(props: { lesson: LessonDTO }) {
  const [editedLesson, setEditedLesson] = useState<LessonDTO>(props.lesson)
  const saveLesson = () => putRequest('admin/lesson', editedLesson)
    .then(() => alert('Saved'))
    .catch(() => alert('Error saving'));
  return (
    <div>
      <RootObjectForm rootObject={editedLesson} rootObjectSetter={setEditedLesson}>
        <TextInput header="Тема Урока" field="topic" />
        <TextInput header="Заметки" field="notes" />
        <DateInput header="Дата" field="date" />
        <button onClick={saveLesson} className="btn btn-primary mt-4 w-full">
          Сохранить
        </button>
      </RootObjectForm>
    </div>
  );
}
