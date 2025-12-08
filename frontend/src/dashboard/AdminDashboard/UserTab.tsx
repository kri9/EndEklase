import { useEffect, useState } from "react";
import UserSelect from "./common/UserSelect";
import { getRequest, postRequest } from "src/api";
import TextInput from "./common/TextInput";
import RootObjectForm from "./common/RootObjectForm";
import BooleanInput from "./common/BooleanInput";
import NumberInput from "./common/NumberInput";
import UserTable from "./common/UserTable";
import { searchParentsByChild } from "src/api";

interface UserFormData {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  phoneNumber: string;
  separateInvoices: boolean;
  discountRate: number;
  children: { id: number; firstname: string; lastname: string }[];
}

const defaultFormValues: UserFormData = {
  id: 0,
  email: "",
  firstName: "",
  lastName: "",
  phoneNumber: "",
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

  const [activeRightTab, setActiveRightTab] = useState<"users" | "children">(
    "users",
  );

  const [childQuery, setChildQuery] = useState("");
  const [childResults, setChildResults] = useState<UserFormData[]>([]);
  const [childSearchLoading, setChildSearchLoading] = useState(false);

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

  // 🔎 авто-поиск по ребёнку при вводе
  const handleChildQueryChange = async (value: string) => {
    setChildQuery(value);

    const q = value.trim();
    if (!q) {
      setChildResults([]);
      return;
    }

    setChildSearchLoading(true);
    try {
      const data = await searchParentsByChild(q);
      const formatted = (data || []).map((u: any) => ({
        ...u,
        discountRate: parseFloat(Number(u.discountRate).toFixed(2)),
      }));
      setChildResults(formatted);
    } catch (err) {
      console.error("Failed to search parents by child", err);
      alert("Kļūda, meklējot vecākus pēc bērna");
    } finally {
      setChildSearchLoading(false);
    }
  };

  // 💄 кнопки табов: у неактивной нормальный текст
  const rightTabButtonClass = (active: boolean) =>
    `btn btn-sm me-2 ${
      active
        ? "btn-primary"
        : "btn-outline-primary bg-white text-primary border-primary"
    }`;

  return (
    <div className="p-6">
      <h2 className="text-3xl mb-5 font-semibold">Lietotāji</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* левая колонка: форма пользователя */}
        <div className="bg-white p-6 shadow-md rounded-lg">
          <h3 className="text-xl font-semibold mb-3">
            Pievienot / Rediģēt lietotāju
          </h3>
          <UserSelect onChange={(_, id) => setUserId(id)} />

          <RootObjectForm rootObject={user} rootObjectSetter={setUser}>
            <TextInput field="email" header="E-pasts" />
            <TextInput field="phoneNumber" header="Telefona numurs" />
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

        {/* правая колонка: табы поиска */}
        <div className="bg-white p-6 shadow-md rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-semibold">Meklēšana</h3>
            <div>
              <button
                type="button"
                className={rightTabButtonClass(activeRightTab === "users")}
                onClick={() => setActiveRightTab("users")}
              >
                Pēc lietotāja
              </button>
              <button
                type="button"
                className={rightTabButtonClass(activeRightTab === "children")}
                onClick={() => setActiveRightTab("children")}
              >
                Pēc bērna
              </button>
            </div>
          </div>

          {activeRightTab === "users" && (
            <>
              <input
                type="text"
                className="form-control my-3"
                placeholder="Meklēt pēc vārda, uzvārda, e-pasta vai telefona"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <UserTable
                users={users}
                searchTerm={searchTerm}
                reloadUsers={loadUsers}
                // showChildren по умолчанию false, showDelete true
              />
            </>
          )}

              {activeRightTab === "children" && (
                <>
                  <div className="my-3 flex gap-2 items-center">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Bērna vārds vai uzvārds"
                      value={childQuery}
                      onChange={(e) => handleChildQueryChange(e.target.value)}
                    />
                    {childSearchLoading && (
                      <span className="text-sm text-muted whitespace-nowrap">
                        Meklē...
                      </span>
                    )}
                  </div>

                  <UserTable
                    users={childResults}
                    searchTerm={""}          // уже отфильтровано на сервере
                    reloadUsers={loadUsers}
                    showDelete={false}       // не показываем кнопки удаления
                    showChildren={true}      // показываем колонку с bērniem
                  />
                </>
              )}


        </div>
      </div>
    </div>
  );
}
