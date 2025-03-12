import { useEffect, useState } from "react";
import UserSelect from "./common/UserSelect";
import { getRequest, postRequest } from "src/api";
import TextInput from "./common/TextInput";
import RootObjectForm from "./common/RootObjectForm";
import BooleanInput from "./common/BooleanInput";
import NumberInput from "./common/NumberInput";
import UserTable from "./common/UserTable";

interface UserFormData {
  id: number,
  email: string,
  firstName: string,
  lastName: string,
  password: string,
  separateInvoices: boolean,
  discountRate: number,
  children: { id: number, firsname: string, lastname: string }[]
}

const defaultFormValues: UserFormData = {
  id: 0,
  email: '',
  firstName: '',
  lastName: '',
  password: '',
  separateInvoices: false,
  discountRate: 0,
  children: []
}

export default function UserTab() {
  const [user, setUser] = useState<UserFormData>(defaultFormValues);
  const [userId, setUserId] = useState<number | undefined>(undefined);
  const [users, setUsers] = useState<UserFormData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (userId) {
      getRequest<UserFormData>(`admin/user/${userId}`).then(setUser);
    } else {
      setUser(defaultFormValues);
    }
    loadUsers();
  }, [userId]);

  const loadUsers = () => {
    getRequest<UserFormData[]>("admin/users").then((data) => {
      const formattedUsers = data.map((user) => ({
        ...user,
        discountRate: parseFloat(Number(user.discountRate).toFixed(2)),
      }));
      setUsers(formattedUsers);
    });
  };

  const saveUser = () => postRequest<any>('admin/user', user)
    .then(r => getRequest<UserFormData>(`admin/user/${r.id}`))
    .then(setUser)
    .then(() => alert('Succesfully saved user'))
    .catch(e => { alert('Failed to save user'); console.log(e) });
    loadUsers();

  return (
    <div className="p-6">
      <h2 className="text-3xl mb-5 font-semibold">Пользователи</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 shadow-md rounded-lg">
          <h3 className="text-xl font-semibold mb-3">Добавить / Изменить пользователя</h3>
          <UserSelect onChange={(_, id) => setUserId(id)} />

          <RootObjectForm rootObject={user} rootObjectSetter={setUser}>
            <TextInput field="email" header="Почта" />
            <TextInput field="firstName" header="Имя" />
            <TextInput field="lastName" header="Фамилия" />
            <TextInput field="password" header="Пароль" />
            <BooleanInput field="separateInvoices" displayText="Отдельные счeта для детей" />
            <NumberInput
              field="discountRate"
              header="Скидка (%)"
              min={0}
              max={1}
              step={0.05}
              valueMapper={(v) => (v / 100).toFixed(2)}
              setterMapper={(v) => v * 100}
            />

            <button onClick={saveUser} className="btn btn-primary mt-4 w-full">
              Сохранить пользователя
            </button>
          </RootObjectForm>
        </div>
        <div className="bg-white p-6 shadow-md rounded-lg">
          <h3 className="text-xl font-semibold mb-3">Список пользователей</h3>
          <input
            type="text"
            className="form-control my-3"
            placeholder="Поиск по имени или email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <UserTable users={users} searchTerm={searchTerm} />
        </div>
      </div>
    </div>
  );
}