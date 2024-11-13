import { useEffect, useState } from "react";
import UserSelect from "./common/UserSelect";
import { getRequest, postRequest } from "src/api";
import TextInput from "./common/TextInput";
import RootObjectForm from "./common/RootObjectForm";
import BooleanInput from "./common/BooleanInput";
import NumberInput from "./common/NumberInput";

interface UserFormData {
  id: number | undefined,
  email: string,
  firstName: string,
  lastName: string,
  password: string,
  separateInvoices: boolean,
  discountRate: number,
  children: { id: number, firsname: string, lastname: string }[]
}

const defaultFormValues: UserFormData = {
  id: undefined,
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
  useEffect(() => {
    userId && getRequest<UserFormData>(`admin/user/${userId}`).then(setUser);
    userId || setUser(defaultFormValues);
  }, [userId])
  const saveUser = () => postRequest<any>('admin/user', user)
    .then(r => getRequest<UserFormData>(`admin/user/${r.id}`))
    .then(setUser)
    .then(() => alert('Succesfully saved user'))
    .catch(e => { alert('Failed to save user'); console.log(e) });

  return (
    <div>
      <h2 className="text-3xl mb-3">Пользователи</h2>
      <div className="text-center invoice-form">
        <UserSelect onChange={(_, id) => setUserId(id)} />
        <h3 className="text-xl my-3">Информация о пользователе:</h3>
        <RootObjectForm rootObject={user} rootObjectSetter={setUser}>
          <TextInput field="email" header="Почта" />
          <TextInput field="firstName" header="Имя" />
          <TextInput field="lastName" header="Фамилия" />
          <TextInput field="password" header="Пароль" />
          <BooleanInput field="separateInvoices" displayText="Отдельные счeта для детей" />
          <NumberInput field="discountRate" header="Скидка (%)" min={0} max={1} step={0.05}
            valueMapper={v => (v / 100).toFixed(2)}
            setterMapper={v => v * 100}
          />
          <button onClick={saveUser} className="btn btn-primary mt-3">
            Сохранить пользователя
          </button>
        </RootObjectForm>
      </div>
    </div>
  );
}
