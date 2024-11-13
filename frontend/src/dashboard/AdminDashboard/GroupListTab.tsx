// GroupListTab.tsx
import React, { useState, useEffect } from "react";
import {
  getKindergartens,
  getGroupsByKindergarten,
  getChildrenByGroup,
  addChild,
  updateChildren,
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

  const [usersInfo, setUsersInfo] = useState<{ id: number; fullName: string }[]>([]);

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

  useEffect(() => {
    const fetchUsers = async () => {
      if (token) {
        const fetchedUsers = await getRequest<{ id: number; fullName: string }[]>("admin/user-emails");
        setUsersInfo(fetchedUsers || []);
      }
    };
    fetchUsers();
  }, [token]);

  const handleKindergartenChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedKindergarten(event.target.value);
    setSelectedGroup("");
    setChildren([]);
  };

  const handleGroupChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedGroup(event.target.value);
    if (token && event.target.value) {
      const fetchedChildren = await getChildrenByGroup(
        token,
        event.target.value
      );
      setChildren(fetchedChildren || []);
    }
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNewChild({ ...newChild, [event.target.name]: event.target.value });
  };

  const handleAddChild = async () => {
    if (
      token &&
      newChild.firstname &&
      newChild.lastname &&
      newChild.userFullName &&
      selectedKindergarten &&
      selectedGroup
    ) {
      const selectedUser = usersInfo.find(
        (user) => user.fullName === newChild.userFullName
      );

      if (!selectedUser) {
        alert("Пользователь не найден");
        return;
      }

      newChild.userId = selectedUser.id;

      const response = await addChild(
        token,
        newChild.firstname,
        newChild.lastname,
        selectedKindergarten,
        selectedGroup,
        newChild.userId
      );

      if (response && response.success) {
        alert("Ребенок успешно добавлен");
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
        alert("Ошибка при добавлении ребенка");
      }
    }
  };

  // New function to handle changes in children's data
  const handleChildChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const updatedChildren = [...children];
    updatedChildren[index][field] = value;
    setChildren(updatedChildren);
  };

  // Function to save changes to the backend
  const handleSaveChildrenChanges = async () => {
    if (token && children.length > 0) {
      try {
        await updateChildren(children);
        alert("Изменения успешно сохранены");
      } catch (error) {
        console.error("Error updating children:", error);
        alert("Ошибка при сохранении изменений");
      }
    }
  };

  return (
    <div>
      <h2 className="text-3xl">Списки групп</h2>
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

      <div className="children-list">
        <h3>Дети в группе:</h3>
        {children.length > 0 ? (
          <>
            <table className="table table-bordered mt-3">
              <thead>
                <tr>
                  <th>Имя</th>
                  <th>Фамилия</th>
                </tr>
              </thead>
              <tbody>
                {children.map((child, index) => (
                  <tr key={child.id}>
                    <td>
                      <input
                        type="text"
                        value={child.firstname}
                        onChange={(e) =>
                          handleChildChange(index, "firstname", e.target.value)
                        }
                        className="form-control"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={child.lastname}
                        onChange={(e) =>
                          handleChildChange(index, "lastname", e.target.value)
                        }
                        className="form-control"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              onClick={handleSaveChildrenChanges}
              className="btn btn-success mt-3"
            >
              Сохранить изменения
            </button>
          </>
        ) : (
          <p>Выберите садик и группу, чтобы увидеть список детей.</p>
        )}
      </div>

      <div className="add-child-form mt-5">
        <h3>Добавить ребенка</h3>
        <div className="form-group mt-3">
          <label htmlFor="firstname">Имя:</label>
          <input
            type="text"
            id="firstname"
            name="firstname"
            className="form-control"
            value={newChild.firstname}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group mt-3">
          <label htmlFor="lastname">Фамилия:</label>
          <input
            type="text"
            id="lastname"
            name="lastname"
            className="form-control"
            value={newChild.lastname}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group mt-3">
          <label htmlFor="userFullName">Имя Пользователя:</label>
          <UserSelect
            onChange={nv => setNewChild({ ...newChild, userFullName: nv })}
          />
        </div>
        <button onClick={handleAddChild} className="btn btn-primary mt-3">
          Добавить ребенка
        </button>
      </div>
    </div>
  );
};

export default GroupListTab;

