import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { getRequest, getKindergartens, getGroupsByKindergarten, getChildrenByGroup, getLessonsByGroup, getAttendanceByGroup } from "src/api";
import { RootState } from "src/redux/store";

interface GenerateInvoicesFormProps {
  onGenerate: (from: string, to: string, groupId: number | "") => void;
}

const GenerateInvoicesForm: React.FC<GenerateInvoicesFormProps> = ({ onGenerate }) => {
  const [generateFrom, setGenerateFrom] = useState("");
  const [generateTo, setGenerateTo] = useState("");
  const [kindergartens, setKindergartens] = useState<any[]>([]);
  const [selectedKindergartenId, setSelectedKindergartenId] = useState<number | "">("");
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | "">("");
  const [children, setChildren] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [attendances, setAttendances] = useState<any[]>([]);
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    loadKindergartens();
  }, []);

  useEffect(() => {
    if (selectedKindergartenId) {
      loadGroups(selectedKindergartenId);
    }
  }, [selectedKindergartenId]);

  useEffect(() => {
    if (selectedGroupId) {
      loadChildren(selectedGroupId);
      loadLessons(selectedGroupId);
      loadAttendances(selectedGroupId);
    }
  }, [selectedGroupId]);

  const loadKindergartens = async () => {
    if (token) {
      const fetchedKindergartens = await getKindergartens(token);
      setKindergartens(fetchedKindergartens || []);
    }
  };

  const loadGroups = async (kindergartenId: number) => {
    if (token) {
      const fetchedGroups = await getGroupsByKindergarten(token, kindergartenId.toString());
      setGroups(fetchedGroups || []);
    }
  };

  const loadChildren = async (groupId: number) => {
    if (token) {
      const fetchedChildren = await getChildrenByGroup(token, groupId.toString());
      setChildren(fetchedChildren || []);
    }
  };

  const loadLessons = async (groupId: number) => {
    if (token) {
      const fetchedLessons = await getLessonsByGroup(token, groupId.toString());
      setLessons(fetchedLessons || []);
    }
  };

  const loadAttendances = async (groupId: number) => {
    if (token) {
      const fetchedAttendances = await getAttendanceByGroup(token, groupId.toString());
      setAttendances(fetchedAttendances || []);
    }
  };

  const handleGenerate = () => {
    onGenerate(generateFrom, generateTo, selectedGroupId);
  };

  return (
    <div className="generate-invoices-form mt-4 ml-4">
      <h3>Сгенерировать счета за период</h3>
      <div className="form-group">
        <label htmlFor="generateFrom">Дата начала:</label>
        <input
          type="date"
          id="generateFrom"
          name="generateFrom"
          className="form-control"
          value={generateFrom}
          onChange={(e) => setGenerateFrom(e.target.value)}
        />
      </div>
      <div className="form-group mt-3">
        <label htmlFor="generateTo">Дата окончания:</label>
        <input
          type="date"
          id="generateTo"
          name="generateTo"
          className="form-control"
          value={generateTo}
          onChange={(e) => setGenerateTo(e.target.value)}
        />
      </div>
      <div className="form-group mt-3">
        <label htmlFor="kindergarten">Детский сад:</label>
        <select
          id="kindergarten"
          name="kindergarten"
          className="form-control"
          value={selectedKindergartenId}
          onChange={(e) => setSelectedKindergartenId(Number(e.target.value))}
        >
          <option value="">-- Выберите детский сад --</option>
          {kindergartens && kindergartens.map((kindergarten) => (
            <option key={kindergarten.id} value={kindergarten.id}>
              {kindergarten.name}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group mt-3">
        <label htmlFor="group">Группа:</label>
        <select
          id="group"
          name="group"
          className="form-control"
          value={selectedGroupId}
          onChange={(e) => setSelectedGroupId(Number(e.target.value))}
        >
          <option value="">-- Выберите группу --</option>
          {groups && groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group mt-3">
        <label htmlFor="children">Дети:</label>
        <select
          id="children"
          name="children"
          className="form-control"
          multiple
        >
          {children && children.map((child) => (
            <option key={child.id} value={child.id}>
              {child.firstname} {child.lastname}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group mt-3">
        <label htmlFor="lessons">Уроки:</label>
        <select
          id="lessons"
          name="lessons"
          className="form-control"
          multiple
        >
          {lessons && lessons.map((lesson) => (
            <option key={lesson.id} value={lesson.id}>
              {lesson.topic} ({lesson.date})
            </option>
          ))}
        </select>
      </div>
      <button onClick={handleGenerate} className="btn btn-secondary mt-3">
        Сгенерировать счета
      </button>
    </div>
  );
};

export default GenerateInvoicesForm;