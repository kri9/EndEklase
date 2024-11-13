import { useEffect, useState } from "react";
import { getRequest } from "src/api";
import Autosuggest from "react-autosuggest";

interface UserSelectProps {
  onChange: (fullname: string, id?: number) => void;
  name?: string
}

export default function UserSelect(props: UserSelectProps) {
  const [userSuggestions, setUserSuggestions] = useState<{ text: string }[]>([]);
  const [usersInfo, setUsersInfo] = useState<{ id: number; fullName: string }[]>([]);
  const [userFullName, setUserFullName] = useState<string>("");

  useEffect(() => {
    getRequest<{ id: number; fullName: string }[]>("admin/user-emails").then(setUsersInfo);
  }, []);

  const updateSuggestions = ({ value }: { value: string }) => {
    setUserSuggestions(
      usersInfo
        .map((user) => user.fullName)
        .filter((name) => name.toLowerCase().includes(value.toLowerCase()))
        .map((name) => ({ text: name }))
    );
  };

  const inputProps = {
    placeholder: "Введите имя пользователя",
    value: userFullName,
    onChange: (event: any, { newValue }: { newValue: string; method: any }) => {
      setUserFullName(newValue);
      const id: number | undefined = usersInfo.filter(u => u.fullName == newValue)?.[0]?.id;
      props.onChange(newValue, id);
    },
    id: props.name,
    name: props.name,
    className: "form-control",
  };

  return (
    <Autosuggest
      suggestions={userSuggestions}
      onSuggestionsFetchRequested={updateSuggestions}
      onSuggestionsClearRequested={() => setUserSuggestions([])}
      getSuggestionValue={(s) => s.text}
      renderSuggestion={(s) => <div>{s.text}</div>}
      inputProps={inputProps}
    />
  );
}
