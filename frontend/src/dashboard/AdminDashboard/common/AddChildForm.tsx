import React, { useState } from "react";
import { addChild } from "src/api";
import { useSelector } from "react-redux";
import { RootState } from "src/redux/store";
import UserSelect from "./UserSelect";

interface AddChildFormProps {
  selectedKindergarten: string;
  selectedGroup: string;
  reloadChildren: () => void;
}

const AddChildForm: React.FC<AddChildFormProps> = ({
  selectedKindergarten,
  selectedGroup,
  reloadChildren,
}) => {
  const [newChild, setNewChild] = useState<{
    firstname: string;
    lastname: string;
    userId: number | null;
    userFullName: string;
  }>({
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

  const token = useSelector((state: RootState) => state.auth.token);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewChild({ ...newChild, [event.target.name]: event.target.value });
  };

  const handleUserChange = (userFullName: string, userId?: number) => {
    setNewChild({
      ...newChild,
      userFullName,
      userId: userId ?? null,
    });
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
    if (!token) {
      alert("Kļūda: autentifikācijas pilnvaras nav atrastas!");
      return;
    }

    if (!validateForm()) return;

    if (!selectedKindergarten || !selectedGroup) {
      alert("Izvēlieties bērnudārzu un grupu pirms bērna pievienošanas");
      return;
    }

    if (newChild.userId === null) {
      alert("Kļūda: lietotāja ID nav atrasts!");
      return;
    }

    try {
      await addChild(
        newChild.firstname,
        newChild.lastname,
        selectedKindergarten,
        selectedGroup,
        newChild.userId,
      );
      alert("Bērns veiksmīgi pievienots");

      setNewChild({
        firstname: "",
        lastname: "",
        userId: null,
        userFullName: "",
      });
      reloadChildren();
    } catch (error) {
      console.error("Ошибка при добавлении ребенка:", error);
      alert("Kļūda, pievienojot bērnu");
    }
  };

  return (
    <div className="bg-white p-6 shadow-md rounded-lg">
      <h3 className="text-xl font-semibold mb-3">Pievienot bērnu</h3>

      <div className="form-group">
        <label>Vārds:</label>
        <input
          type="text"
          name="firstname"
          className={`form-control ${formErrors.firstname ? "is-invalid" : ""}`}
          value={newChild.firstname}
          onChange={handleInputChange}
        />
      </div>

      <div className="form-group">
        <label>Uzvārds:</label>
        <input
          type="text"
          name="lastname"
          className={`form-control ${formErrors.lastname ? "is-invalid" : ""}`}
          value={newChild.lastname}
          onChange={handleInputChange}
        />
      </div>

      <div className="form-group">
        <label>Izvēlieties vecāku:</label>
        <UserSelect onChange={handleUserChange} name="userFullName" />
        {formErrors.userFullName && (
          <div className="invalid-feedback">Lūdzu, izvēlieties vecāku.</div>
        )}
      </div>

      <button onClick={handleAddChild} className="btn btn-primary mt-3 w-full">
        Pievienot bērnu
      </button>
    </div>
  );
};

export default AddChildForm;
