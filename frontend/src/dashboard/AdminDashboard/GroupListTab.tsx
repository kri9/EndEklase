import React, { useState, useEffect } from "react";
import {
  getKindergartens,
  getGroupsByKindergarten,
  getChildrenByGroup,
  addChild,
  updateChildren,
  deleteChildren,
  getRequest,
} from "src/api";
import { useSelector } from "react-redux";
import { RootState } from "src/redux/store";
import UserSelect from "./common/UserSelect";

const GroupListTab: React.FC = () => {
  const [selectedKindergarten, setSelectedKindergarten] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [kindergartens, setKindergartens] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [children, setChildren] = useState<any[]>([]);
  const [newChild, setNewChild] = useState<any>({
    firstname: "",
    lastname: "",
    userId: null,
    userFullName: "",
  });

  const [formErrors, setFormErrors] = useState({
    firstname: false,
    lastname: false,
    userFullName: false,
  });

  const [usersInfo, setUsersInfo] = useState<{ id: number; fullName: string }[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        const fetchedGroups = await getGroupsByKindergarten(token, selectedKindergarten);
        setGroups(fetchedGroups || []);
      } else {
        setGroups([]);
      }
    };
    loadGroups();
  }, [token, selectedKindergarten]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (token) {
        const fetchedUsers = await getRequest<{ id: number; fullName: string }[]>("admin/user-emails");
        setUsersInfo(fetchedUsers || []);
      }
    };
    fetchUsers();
  }, [token]);

  const handleKindergartenChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedKindergarten(event.target.value);
    setSelectedGroup("");
    setChildren([]);
  };

  const handleGroupChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGroup(event.target.value);
    if (token && event.target.value) {
      const fetchedChildren = await getChildrenByGroup(token, event.target.value);
      setChildren(
        fetchedChildren.map((child: any) => ({
          ...child,
          isDeleted: false,
        })) || []
      );
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewChild({ ...newChild, [event.target.name]: event.target.value });
  };

  const validateForm = () => {
    const errors = {
      firstname: !newChild.firstname.trim(),
      lastname: !newChild.lastname.trim(),
      userFullName: !newChild.userFullName.trim(),
    };
    setFormErrors(errors);
    return !Object.values(errors).some((error) => error);
  };

  const handleAddChild = async () => {
    if (!validateForm()) return;

    const selectedUser = usersInfo.find((user) => user.fullName === newChild.userFullName);

    if (!selectedUser) {
      setFormErrors((prev) => ({ ...prev, userFullName: true }));
      return;
    }

    newChild.userId = selectedUser.id;

    if (token) {
      const response = await addChild(
        token,
        newChild.firstname,
        newChild.lastname,
        selectedKindergarten,
        selectedGroup,
        newChild.userId
      );

      if (response && response.success) {
        setMessage("Ребенок успешно добавлен");
        setNewChild({
          firstname: "",
          lastname: "",
          userId: null,
          userFullName: "",
        });
        await handleGroupChange({
          target: { value: selectedGroup },
        } as React.ChangeEvent<HTMLSelectElement>);
      } else {
        setError("Ошибка при добавлении ребенка");
      }
    }
  };

  const handleChildChange = (index: number, field: string, value: string) => {
    const updatedChildren = [...children];
    updatedChildren[index][field] = value;
    setChildren(updatedChildren);
  };

  const handleChildDelete = (index: number) => {
    const updatedChildren = [...children];
    updatedChildren[index].isDeleted = !updatedChildren[index].isDeleted;
    setChildren(updatedChildren);
  };

  const handleSaveChildrenChanges = async () => {
    if (token && children.length > 0) {
      try {
        const toUpdate = children.filter((child) => !child.isDeleted);
        const toDelete = children.filter((child) => child.isDeleted);

        if (toUpdate.length > 0) {
          await updateChildren(toUpdate);
        }

        if (toDelete.length > 0) {
          await deleteChildren(token, toDelete.map((child) => child.id));
        }

        setMessage("Изменения успешно сохранены");
        await handleGroupChange({
          target: { value: selectedGroup },
        } as React.ChangeEvent<HTMLSelectElement>);
      } catch (error) {
        console.error("Error updating children:", error);
        setError("Ошибка при сохранении изменений");
      }
    }
  };

  return (
    <div className="group-list-tab">
      <h2 className="text-3xl mb-4">Списки групп</h2>
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
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
        <div className="form-group">
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

      <div className="children-container">
        <div className="children-list">
          <h3>Дети в группе:</h3>
          {children.length > 0 ? (
            <>
              <table className="table table-bordered mt-3">
                <thead>
                  <tr>
                    <th>Имя</th>
                    <th>Фамилия</th>
                    <th>Действие</th>
                  </tr>
                </thead>
                <tbody>
                  {children.map((child, index) => (
                    <tr key={child.id} className={child.isDeleted ? "table-danger" : ""}>
                      <td>
                        <input
                          type="text"
                          value={child.firstname}
                          onChange={(e) => handleChildChange(index, "firstname", e.target.value)}
                          className="form-control"
                          disabled={child.isDeleted}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={child.lastname}
                          onChange={(e) => handleChildChange(index, "lastname", e.target.value)}
                          className="form-control"
                          disabled={child.isDeleted}
                        />
                      </td>
                      <td>
                        <button
                          className={`btn ${child.isDeleted ? "btn-success" : "btn-danger"}`}
                          onClick={() => handleChildDelete(index)}
                        >
                          {child.isDeleted ? "Восстановить" : "Удалить"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={handleSaveChildrenChanges} className="btn btn-success mt-3">
                Сохранить изменения
              </button>
            </>
          ) : (
            <p>Выберите садик и группу, чтобы увидеть список детей.</p>
          )}
        </div>

        <div className="add-child-form">
          <h3>Добавить ребенка</h3>
          <div className="form-group mt-3">
            <label htmlFor="firstname">Имя:</label>
            <input
              type="text"
              id="firstname"
              name="firstname"
              className={`form-control ${formErrors.firstname ? "is-invalid" : ""}`}
              value={newChild.firstname}
              onChange={handleInputChange}
            />
            {formErrors.firstname && <div className="invalid-feedback">Пожалуйста, укажите имя.</div>}
          </div>

          <div className="form-group mt-3">
            <label htmlFor="lastname">Фамилия:</label>
            <input
              type="text"
              id="lastname"
              name="lastname"
              className={`form-control ${formErrors.lastname ? "is-invalid" : ""}`}
              value={newChild.lastname}
              onChange={handleInputChange}
            />
            {formErrors.lastname && <div className="invalid-feedback">Пожалуйста, укажите фамилию.</div>}
          </div>

          <div className="form-group mt-3">
            <label htmlFor="userFullName">Имя родителя:</label>
            <UserSelect onChange={(nv) => setNewChild({ ...newChild, userFullName: nv })} />
            {formErrors.userFullName && <div className="invalid-feedback">Пожалуйста, выберите родителя.</div>}
          </div>
          <button onClick={handleAddChild} className="btn btn-primary mt-3">
            Добавить ребенка
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupListTab;