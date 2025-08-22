import { useEffect, useState } from "react";
import UserSelect from "./common/UserSelect";
import { getRequest, postRequest } from "src/api";
import TextInput from "./common/TextInput";
import RootObjectForm from "./common/RootObjectForm";
import BooleanInput from "./common/BooleanInput";
import NumberInput from "./common/NumberInput";
import UserTable from "./common/UserTable";

interface UserFormData {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  separateInvoices: boolean;
  discountRate: number;
  children: { id: number; firsname: string; lastname: string }[];
}

const defaultFormValues: UserFormData = {
  id: 0,
  email: "",
  firstName: "",
  lastName: "",
  password: "",
  separateInvoices: false,
  discountRate: 0,
  children: [],
};

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

  const saveUser = () =>
    postRequest<any>("admin/user", user)
      .then((r) => getRequest<UserFormData>(`admin/user/${r.id}`))
      .then(setUser)
      .then(() => alert("Succesfully saved user"))
      .catch((e) => {
        alert("Failed to save user");
        console.log(e);
      });

  return (
    <div className="p-6">
      <h2 className="text-3xl mb-5 font-semibold">Lietotāji</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 shadow-md rounded-lg">
          <h3 className="text-xl font-semibold mb-3">
            Pievienot / Rediģēt lietotāju
          </h3>
          <UserSelect onChange={(_, id) => setUserId(id)} />

          <RootObjectForm rootObject={user} rootObjectSetter={setUser}>
            <TextInput field="email" header="E-pasts" />
            <TextInput field="firstName" header="Vārds" />
            <TextInput field="lastName" header="Uzvārds" />
            <TextInput field="password" header="Parole" />
            <BooleanInput
              field="separateInvoices"
              displayText="Atsevišķi rēķini bērniem"
            />
            <NumberInput
              field="discountRate"
              header="Atlaide (%)"
              min={0}
              max={1}
              step={0.05}
              valueMapper={(v) => (v / 100).toFixed(2)}
              setterMapper={(v) => v * 100}
            />

            <button onClick={saveUser} className="btn btn-primary mt-4 w-full">
              Saglabāt lietotāju
            </button>
          </RootObjectForm>
        </div>
        <div className="bg-white p-6 shadow-md rounded-lg">
          <h3 className="text-xl font-semibold mb-3">Lietotāju saraksts</h3>
          <input
            type="text"
            className="form-control my-3"
            placeholder="Meklēt pēc vārda vai e-pasta"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <UserTable
            users={users}
            searchTerm={searchTerm}
            reloadUsers={loadUsers}
          />
        </div>
      </div>
    </div>
  );
}

