import React, { useState, useEffect } from "react";
import { getKindergartens, getGroupsByKindergarten, addLesson } from "src/api";
import { useSelector } from "react-redux";
import { RootState } from "src/redux/store";
import { FileUploadButton } from "./common/FileUploadButton";

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
      const fetchedKindergartens = await getKindergartens();
      setKindergartens(fetchedKindergartens || []);
    };
    loadKindergartens();
  }, [token]);

  useEffect(() => {
    const loadGroups = async () => {
      if (token && selectedKindergarten) {
        const fetchedGroups =
          await getGroupsByKindergarten(selectedKindergarten);
        setGroups(fetchedGroups || []);
      } else {
        setGroups([]);
      }
    };
    loadGroups();
  }, [token, selectedKindergarten]);

  const handleKindergartenChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setSelectedKindergarten(event.target.value);
    setSelectedGroup("");
  };

  const handleGroupChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGroup(event.target.value);
  };

  const handleLessonInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setNewLesson({ ...newLesson, [event.target.name]: event.target.value });
  };

  const handleAddLesson = async () => {
    if (newLesson.topic && newLesson.date) {
      if (token && selectedGroup) {
        const response = await addLesson({
          ...newLesson,
          groupId: selectedGroup,
        });
        if (response && response.success) {
          alert("Stunda veiksmīgi pievienota");
          setNewLesson({ topic: "", date: "", notes: "" });
        } else {
          alert("Kļūda, pievienojot stundu");
        }
      }
    }
  };

  return (
    <div>
      <h2 className="text-3xl">Stundu pievienošana</h2>
      <div className="filters mb-4">
        <div className="form-group">
          <label htmlFor="kindergartenSelect">Izvēlieties bērnudārzu:</label>
          <select
            id="kindergartenSelect"
            className="form-control"
            value={selectedKindergarten}
            onChange={handleKindergartenChange}
          >
            <option value="">-- Izvēlieties bērnudārzu --</option>
            {kindergartens.map((kg) => (
              <option key={kg.id} value={kg.id}>
                {kg.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group mt-3">
          <label htmlFor="groupSelect">Izvēlieties grupu:</label>
          <select
            id="groupSelect"
            className="form-control"
            value={selectedGroup}
            onChange={handleGroupChange}
            disabled={!selectedKindergarten}
          >
            <option value="">-- Izvēlieties grupu --</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="add-lesson-form mt-5">
        <h3>Pievienot stundu</h3>
        <div className="form-group mt-3">
          <label htmlFor="topic">Stundas tēma:</label>
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
          <label htmlFor="date">Datums:</label>
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
          <label htmlFor="notes">Piezīmes:</label>
          <textarea
            id="notes"
            name="notes"
            className="form-control"
            value={newLesson.notes}
            onChange={handleLessonInputChange}
          ></textarea>
        </div>
        <button onClick={handleAddLesson} className="btn btn-primary mt-3">
          Pievienot stundu
        </button>
        <FileUploadButton
          acceptedFileExtension=".xlsx"
          buttonTitle="Importēt stundas"
          uploadUrl="admin/lessons/import"
        />
      </div>
    </div>
  );
};

export default AddLessonTab;
