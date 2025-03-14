import React, { useState, useEffect } from "react";
import { deleteChildren, updateChildren } from "src/api";
import { useSelector } from "react-redux";
import { RootState } from "src/redux/store";

const GroupChildrenList: React.FC<{ editedChildren: any[], reloadChildren: () => void }> = ({ editedChildren, reloadChildren }) => {
  const [localEditedChildren, setLocalEditedChildren] = useState<any[]>(editedChildren || []);
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    setLocalEditedChildren(
      [...editedChildren].sort((a, b) => {
        const fullNameA = `${a.lastname} ${a.firstname}`;
        const fullNameB = `${b.lastname} ${b.firstname}`;
        return fullNameA.localeCompare(fullNameB, 'lv', { sensitivity: 'base' });
      })
    );
  }, [editedChildren]);
  
  const handleChildChange = (index: number, field: string, value: string) => {
    const updatedChildren = [...localEditedChildren];
    updatedChildren[index] = { ...updatedChildren[index], [field]: value };
    setLocalEditedChildren(updatedChildren);
  };

  const handleChildDelete = async (index: number) => {
    if (!token) {
      alert("Ошибка: не найден токен аутентификации!");
      return;
    }

    const child = localEditedChildren[index];
    const confirmDelete = window.confirm(`Вы уверены, что хотите удалить ${child.firstname} ${child.lastname}?`);
    if (!confirmDelete) return;

    try {
      await deleteChildren(token, [child.id]);
      reloadChildren();
    } catch (error) {
      console.error("Ошибка при удалении ребенка:", error);
      alert("Ошибка при удалении ребенка");
    }
  };

  const handleSaveChildrenChanges = async () => {
    if (!token) {
      alert("Ошибка: не найден токен аутентификации!");
      return;
    }

    try {
      await updateChildren(localEditedChildren);
      alert("Изменения успешно сохранены");
      reloadChildren();
    } catch (error) {
      console.error("Ошибка при сохранении:", error);
      alert("Ошибка при сохранении изменений");
    }
  };

  return (
    <div className="bg-white p-6 shadow-md rounded-lg">
      <h3 className="text-xl font-semibold mb-3">Дети в группе</h3>
      {localEditedChildren.length > 0 ? (
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
              {localEditedChildren.map((child, index) => (
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
  );
};

export default GroupChildrenList;
