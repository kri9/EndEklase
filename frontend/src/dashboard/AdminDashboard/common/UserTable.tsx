import React from "react";
import { deleteRequest } from "src/api";

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  discountRate: number;
}

interface UserTableProps {
  users: User[];
  searchTerm: string;
}

export default function UserTable({ users, searchTerm }: UserTableProps) {
  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <table className="table table-bordered mt-3">
      <thead>
        <tr>
          <th>ID</th>
          <th>Email</th>
          <th>vārds</th>
          <th>Uzvārds</th>
          <th>Atlaide (%)</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.email}</td>
              <td>{user.firstName}</td>
              <td>{user.lastName}</td>
              <td>{user.discountRate * 100}%</td>
              <td>
                <button
                  onClick={() => deleteRequest(`admin/user/${user.id}`, null)}
                  className="btn btn-danger"
                >
                  Dzēst
                </button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={5} className="text-center">
              Пользователи не найдены
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
