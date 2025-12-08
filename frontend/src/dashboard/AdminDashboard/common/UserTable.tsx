// common/UserTable.tsx
import { deleteRequest } from "src/api";

interface ChildInfo {
  id: number;
  firstname: string;
  lastname: string;
}

interface User {
  id: number;
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  discountRate: number;
  children?: ChildInfo[];
}

interface UserTableProps {
  users: User[];
  searchTerm: string;
  reloadUsers: () => void;
  showDelete?: boolean;      // показывать колонку "Dzēst"
  showChildren?: boolean;    // показывать колонку "Bērni"
}

export default function UserTable({
  users,
  searchTerm,
  reloadUsers,
  showDelete = true,
  showChildren = false,
}: UserTableProps) {
  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phoneNumber ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleDelete = async (id: number) => {
    const ok = window.confirm(
      "Vai esat pārliecināts, ka vēlaties dzēst lietotāju?",
    );
    if (!ok) return;

    await deleteRequest(`admin/user/${id}`, null);
    reloadUsers();
  };

  // базовых колонок 6, плюс Bērni и Delete по флагам
  let columnsCount = 6;
  if (showChildren) columnsCount += 1;
  if (showDelete) columnsCount += 1;

  return (
    <table className="table table-bordered mt-3">
      <thead>
        <tr>
          <th>ID</th>
          <th>Email</th>
          <th>Telefona numurs</th>
          <th>Vārds</th>
          <th>Uzvārds</th>
          <th>Atlaide (%)</th>
          {showChildren && <th>Bērns / Bērni</th>}
          {showDelete && <th></th>}
        </tr>
      </thead>
      <tbody>
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.email}</td>
              <td>{user.phoneNumber || "-"}</td>
              <td>{user.firstName}</td>
              <td>{user.lastName}</td>
              <td>{user.discountRate * 100}%</td>

              {showChildren && (
                <td>
                  {user.children && user.children.length
                    ? user.children
                        .map((c) => `${c.firstname} ${c.lastname}`)
                        .join(", ")
                    : "-"}
                </td>
              )}

              {showDelete && (
                <td>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="btn btn-danger"
                  >
                    Dzēst
                  </button>
                </td>
              )}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={columnsCount} className="text-center">
              Lietotāji nav atrasti
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
