import React, { useState, useEffect } from "react";
import {
  getKindergartens,
  getGroupsByKindergarten,
  addLesson,
} from "../api";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

interface Lesson {
  id?: number;
  topic: string;
  date: string;
  notes?: string;
}

const AddLessonTab: React.FC = () => {
  const [selectedKindergarten, setSelectedKindergarten] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [kindergartens, setKindergartens] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [newLesson, setNewLesson] = useState<Lesson>({
    topic: "",
    date: "",
    notes: "",
  });

  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    const loadKindergartens = async () => {
      if (token) {
        const fetchedKindergartens = await getKindergartens(token);
        setKindergartens(fetchedKindergartens || []);
      }
    };
    loadKindergartens();
  }, [token]);

  useEffect(() => {
    const loadGroups = async () => {
      if (token && selectedKindergarten) {
        const fetchedGroups = await getGroupsByKindergarten(
          token,
          selectedKindergarten
        );
        setGroups(fetchedGroups || []);
      } else {
        setGroups([]);
      }
    };
    loadGroups();
  }, [token, selectedKindergarten]);

  const handleKindergartenChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedKindergarten(event.target.value);
    setSelectedGroup("");
  };

  const handleGroupChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedGroup(event.target.value);
  };

  const handleLessonInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setNewLesson({ ...newLesson, [event.target.name]: event.target.value });
  };

  const handleAddLesson = async () => {
    if (newLesson.topic && newLesson.date) {
      if (token && selectedGroup) {
        const response = await addLesson(token, {
          ...newLesson,
          groupId: selectedGroup,
        });
        if (response && response.success) {
          alert("Урок успешно добавлен");
          setNewLesson({ topic: "", date: "", notes: "" });
        } else {
          alert("Ошибка при добавлении урока");
        }
      }
    }
  };

  return (
    <div>
      <h2>Добавление уроков</h2>
      <div className="filters mb-4">
        <div className="form-group">
          <label htmlFor="kindergartenSelect">Выберите садик:</label>
          <select
            id="kindergartenSelect"
            className="form-control"
            value={selectedKindergarten}
            onChange={handleKindergartenChange}
          >
            <option value="">-- Выберите садик --</option>
            {kindergartens.map((kg) => (
              <option key={kg.id} value={kg.id}>
                {kg.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group mt-3">
          <label htmlFor="groupSelect">Выберите группу:</label>
          <select
            id="groupSelect"
            className="form-control"
            value={selectedGroup}
            onChange={handleGroupChange}
            disabled={!selectedKindergarten}
          >
            <option value="">-- Выберите группу --</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="add-lesson-form mt-5">
        <h3>Добавить урок</h3>
        <div className="form-group mt-3">
          <label htmlFor="topic">Тема урока:</label>
          <input
            type="text"
            id="topic"
            name="topic"
            className="form-control"
            value={newLesson.topic}
            onChange={handleLessonInputChange}
          />
        </div>
        <div className="form-group mt-3">
          <label htmlFor="date">Дата:</label>
          <input
            type="date"
            id="date"
            name="date"
            className="form-control"
            value={newLesson.date}
            onChange={handleLessonInputChange}
          />
        </div>
        <div className="form-group mt-3">
          <label htmlFor="notes">Заметки:</label>
          <textarea
            id="notes"
            name="notes"
            className="form-control"
            value={newLesson.notes}
            onChange={handleLessonInputChange}
          ></textarea>
        </div>
        <button onClick={handleAddLesson} className="btn btn-primary mt-3">
          Добавить урок
        </button>
      </div>
    </div>
  );
};

export default AddLessonTab;

