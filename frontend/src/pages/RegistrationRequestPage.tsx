import React, { useEffect, useMemo, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "src/resetpass/css/AuthPages.css";
import { Link } from "react-router-dom";
import { FaUserPlus, FaPlus, FaTrash, FaPaperPlane } from "react-icons/fa";
import { getKindergartens, getGroupsByKindergarten, registrationRequest } from "src/api";

type Lang = "ru" | "lv";
type KG = { id: number | string; name: string };
type Group = { id: number | string; name: string };

type ChildDraft = { firstname: string; lastname: string };

const RegistrationRequestPage: React.FC = () => {
  const [language, setLanguage] = useState<Lang>("ru");

  const [kindergartens, setKindergartens] = useState<KG[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  const [kindergartenId, setKindergartenId] = useState<string>("");
  const [groupId, setGroupId] = useState<string>("");

  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [children, setChildren] = useState<ChildDraft[]>([{ firstname: "", lastname: "" }]);

  const [validated, setValidated] = useState(false);
  const [busy, setBusy] = useState(false);

  const [serverMsg, setServerMsg] = useState<{ type: "success" | "danger"; text: string } | null>(null);

  const t = (ru: string, lv: string) => (language === "ru" ? ru : lv);

  useEffect(() => {
    // публичная страница — токена нет, поэтому нужен public endpoint для kindergartens/groups
    // если у тебя /admin/kindergartens закрыт, сделай /public/kindergartens.
    getKindergartens()
      .then((list: KG[]) => setKindergartens(list || []))
      .catch(() => setKindergartens([]));
  }, []);

  useEffect(() => {
    if (!kindergartenId) {
      setGroups([]);
      setGroupId("");
      return;
    }
    getGroupsByKindergarten(kindergartenId)
      .then((list: Group[]) => setGroups(list || []))
      .catch(() => setGroups([]));
    setGroupId("");
  }, [kindergartenId]);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!kindergartenId) e.kindergartenId = t("Выберите садик", "Izvēlieties bērnudārzu");
    if (!groupId) e.groupId = t("Выберите группу", "Izvēlieties grupu");
    if (!email.trim()) e.email = t("Email не может быть пустым", "E-pasts nevar būt tukšs");
    if (!firstName.trim()) e.firstName = t("Укажите имя", "Norādiet vārdu");
    if (!lastName.trim()) e.lastName = t("Укажите фамилию", "Norādiet uzvārdu");
    if (!phoneNumber.trim()) e.phoneNumber = t("Укажите телефон", "Norādiet tālruni");

    const hasAtLeastOneChild = children.some(c => (c.firstname.trim() || c.lastname.trim()));
    if (!hasAtLeastOneChild) e.children = t("Добавьте хотя бы одного ребёнка", "Pievienojiet vismaz vienu bērnu");

    children.forEach((c, idx) => {
      if (c.firstname.trim() || c.lastname.trim()) {
        if (!c.firstname.trim()) e[`child_fn_${idx}`] = t("Имя ребёнка обязательно", "Bērna vārds ir obligāts");
        if (!c.lastname.trim()) e[`child_ln_${idx}`] = t("Фамилия ребёнка обязательна", "Bērna uzvārds ir obligāts");
      }
    });

    return e;
  }, [language, kindergartenId, groupId, email, firstName, lastName, phoneNumber, children]);

  const isValid = () => Object.keys(errors).length === 0;

  const addChildRow = () => setChildren(prev => prev.concat({ firstname: "", lastname: "" }));
  const removeChildRow = (idx: number) => setChildren(prev => prev.length === 1 ? prev : prev.filter((_, i) => i !== idx));

  const updateChild = (idx: number, key: keyof ChildDraft, value: string) => {
    setChildren(prev => prev.map((c, i) => (i === idx ? { ...c, [key]: value } : c)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidated(true);
    setServerMsg(null);
    if (!isValid()) return;

    const payload = {
      kindergartenId: Number(kindergartenId),
      groupId: Number(groupId),
      email: email.trim(),
      phoneNumber: phoneNumber.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      children: children
        .map(c => ({ firstname: c.firstname.trim(), lastname: c.lastname.trim() }))
        .filter(c => c.firstname && c.lastname),
    };

    try {
      setBusy(true);
      await registrationRequest(payload);
      setServerMsg({
        type: "success",
        text: t(
          "Заявка отправлена! Проверьте e-mail и подтвердите адрес по ссылке.",
          "Pieteikums nosūtīts! Pārbaudiet e-pastu un apstipriniet adresi ar saiti."
        ),
      });
      // можно не чистить, но обычно приятно
      // setEmail(""); setPhoneNumber(""); setFirstName(""); setLastName(""); setChildren([{ firstname:"", lastname:"" }]);
    } catch (err: any) {
      setServerMsg({
        type: "danger",
        text: t(
          "Не удалось отправить заявку. Возможно, этот e-mail уже зарегистрирован.",
          "Neizdevās nosūtīt pieteikumu. Iespējams, šis e-pasts jau ir reģistrēts."
        ),
      });
    } finally {
      setBusy(false);
    }
  };

  const showInvalid = (key: string) => validated && !!errors[key];

  return (
    <div className="auth-wrapper">
      <div className="auth-container" style={{ maxWidth: 560 }}>
        <div className="language-switcher">
          <select value={language} onChange={(e) => setLanguage(e.target.value as Lang)} className="form-select">
            <option value="ru">Русский</option>
            <option value="lv">Latviešu</option>
          </select>
        </div>

        <form className={`needs-validation ${validated ? "was-validated" : ""}`} noValidate onSubmit={handleSubmit}>
          <h2 className="text-center mb-4">
            <FaUserPlus className="me-2" />
            {t("Заявка в детский сад", "Pieteikums bērnudārzam")}
          </h2>

          {/* KG */}
          <div className="mb-3">
            <label className="form-label">{t("Детский сад", "Bērnudārzs")}</label>
            <select
              className={`form-select ${showInvalid("kindergartenId") ? "is-invalid" : ""}`}
              value={kindergartenId}
              onChange={(e) => setKindergartenId(e.target.value)}
              required
            >
              <option value="">{t("— выберите —", "— izvēlieties —")}</option>
              {kindergartens.map(k => (
                <option key={String(k.id)} value={String(k.id)}>{k.name}</option>
              ))}
            </select>
            <div className="invalid-feedback">{errors.kindergartenId}</div>
          </div>

          {/* Group */}
          <div className="mb-3">
            <label className="form-label">{t("Группа", "Grupa")}</label>
            <select
              className={`form-select ${showInvalid("groupId") ? "is-invalid" : ""}`}
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              disabled={!kindergartenId}
              required
            >
              <option value="">{t("— выберите —", "— izvēlieties —")}</option>
              {groups.map(g => (
                <option key={String(g.id)} value={String(g.id)}>{g.name}</option>
              ))}
            </select>
            <div className="invalid-feedback">{errors.groupId}</div>
          </div>

          {/* User data */}
          <div className="mb-3">
            <label className="form-label">{t("E-mail", "E-pasts")}</label>
            <input
              type="email"
              className={`form-control ${showInvalid("email") ? "is-invalid" : ""}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="invalid-feedback">{errors.email}</div>
          </div>

          <div className="mb-3">
            <label className="form-label">{t("Телефон", "Tālrunis")}</label>
            <input
              type="text"
              className={`form-control ${showInvalid("phoneNumber") ? "is-invalid" : ""}`}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
            <div className="invalid-feedback">{errors.phoneNumber}</div>
          </div>

          <div className="mb-3">
            <label className="form-label">{t("Имя", "Vārds")}</label>
            <input
              type="text"
              className={`form-control ${showInvalid("firstName") ? "is-invalid" : ""}`}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <div className="invalid-feedback">{errors.firstName}</div>
          </div>

          <div className="mb-3">
            <label className="form-label">{t("Фамилия", "Uzvārds")}</label>
            <input
              type="text"
              className={`form-control ${showInvalid("lastName") ? "is-invalid" : ""}`}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
            <div className="invalid-feedback">{errors.lastName}</div>
          </div>

          {/* Children */}
          <div className="mt-4">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <h5 className="m-0">{t("Дети", "Bērni")}</h5>
              <button type="button" className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2" onClick={addChildRow}>
                <FaPlus /> {t("Добавить", "Pievienot")}
              </button>
            </div>

            {validated && errors.children && (
              <div className="alert alert-danger py-2">{errors.children}</div>
            )}

            {children.map((c, idx) => (
              <div key={idx} className="row g-2 align-items-end mb-2">
                <div className="col-5">
                  <label className="form-label">{t("Имя", "Vārds")}</label>
                  <input
                    type="text"
                    className={`form-control ${showInvalid(`child_fn_${idx}`) ? "is-invalid" : ""}`}
                    value={c.firstname}
                    onChange={(e) => updateChild(idx, "firstname", e.target.value)}
                  />
                  <div className="invalid-feedback">{errors[`child_fn_${idx}`]}</div>
                </div>
                <div className="col-5">
                  <label className="form-label">{t("Фамилия", "Uzvārds")}</label>
                  <input
                    type="text"
                    className={`form-control ${showInvalid(`child_ln_${idx}`) ? "is-invalid" : ""}`}
                    value={c.lastname}
                    onChange={(e) => updateChild(idx, "lastname", e.target.value)}
                  />
                  <div className="invalid-feedback">{errors[`child_ln_${idx}`]}</div>
                </div>
                <div className="col-2 d-flex justify-content-end">
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => removeChildRow(idx)}
                    title={t("Удалить", "Dzēst")}
                    disabled={children.length === 1}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={busy}
            className="btn btn-primary btn-block w-100 shadow-sm d-flex justify-content-center align-items-center gap-2 mt-4"
          >
            <FaPaperPlane />
            {busy ? t("Отправка…", "Nosūtīšana…") : t("Отправить заявку", "Nosūtīt pieteikumu")}
          </button>

          <div className="text-center mt-3">
            <Link to="/login" className="text-decoration-none">
              {t("Вернуться к входу", "Atpakaļ uz pieslēgšanos")}
            </Link>
          </div>

          {serverMsg && (
            <div className={`alert mt-3 alert-${serverMsg.type}`} role="alert">
              {serverMsg.text}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default RegistrationRequestPage;
