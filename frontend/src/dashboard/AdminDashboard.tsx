import React, { useState, useEffect } from 'react';
import './css/AdminDashboard.css';
import { addChild, getKindergartens, getGroupsByKindergarten, getChildrenByGroup } from '../api';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

const AdminDashboard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('Списки групп');
  const [selectedKindergarten, setSelectedKindergarten] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [children, setChildren] = useState<any[]>([]);
  const [kindergartens, setKindergartens] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [newChild, setNewChild] = useState({ firstname: '', lastname: '', kindergartenId: '', groupId: '' });
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    // Fetch kindergartens from backend
    const loadKindergartens = async () => {
      if (token) {
        const fetchedKindergartens = await getKindergartens(token);
        console.log('Fetched Kindergartens:', fetchedKindergartens);
        setKindergartens(fetchedKindergartens || []);
      }
    };
    loadKindergartens();
  }, [token]);
  

  useEffect(() => {
    // Fetch groups based on selected kindergarten
    const loadGroups = async () => {
      if (token && selectedKindergarten) {
        const fetchedGroups = await getGroupsByKindergarten(token, selectedKindergarten);
        setGroups(fetchedGroups || []);
      } else {
        setGroups([]);
      }
    };
    loadGroups();
  }, [token, selectedKindergarten]);

  const handleKindergartenChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedKindergarten(event.target.value);
    setSelectedGroup('');
    setChildren([]);
  };

  const handleGroupChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGroup(event.target.value);
    if (token && event.target.value) {
      const fetchedChildren = await getChildrenByGroup(token, event.target.value);
      console.log('Fetched Children:', fetchedChildren);
      setChildren(fetchedChildren || []);
    }
  };
  

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNewChild({ ...newChild, [event.target.name]: event.target.value });
  };

  const handleAddChild = async () => {
    if (token && newChild.firstname && newChild.lastname && selectedKindergarten && selectedGroup) {
      const response = await addChild(
        token, 
        newChild.firstname, 
        newChild.lastname, 
        selectedKindergarten, 
        selectedGroup
      );
  
      if (response && response.success) {
        alert('Ребенок успешно добавлен');
        setNewChild({ firstname: '', lastname: '', kindergartenId: '', groupId: '' });
  
        // Обновляем список детей после успешного добавления
        await handleGroupChange({ target: { value: selectedGroup } } as React.ChangeEvent<HTMLSelectElement>);
      } else {
        alert('Ошибка при добавлении ребенка');
      }
    }
  };
    
  
  const renderTabContent = () => {
    switch (selectedTab) {
      case 'Посещение':
        return <p>Посещение.</p>;
      case 'Списки групп':
        return (
          <div>
            <h2>Списки групп</h2>
            <div className="filters mb-4">
              <div className="form-group">
                <label htmlFor="kindergartenSelect">Выберите садик:</label>
                <select
                  id="kindergartenSelect"
                  className="form-control"
                  value={selectedKindergarten}
                  onChange={handleKindergartenChange}
                >
                  <option value="">-- Выберите садик --</option>
                  {kindergartens.map((kg) => (
                    <option key={kg.id} value={kg.id}>
                      {kg.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group mt-3">
                <label htmlFor="groupSelect">Выберите группу:</label>
                <select
                  id="groupSelect"
                  className="form-control"
                  value={selectedGroup}
                  onChange={handleGroupChange}
                  disabled={!selectedKindergarten}
                >
                  <option value="">-- Выберите группу --</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="children-list">
              <h3>Дети в группе:</h3>
              {children.length > 0 ? (
                <table className="table table-bordered mt-3">
                  <thead>
                    <tr>
                      <th>Имя</th>
                      <th>Фамилия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {children.map((child) => (
                      <tr key={child.id}>
                        <td>{child.firstname}</td>
                        <td>{child.lastname}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>Выберите садик и группу, чтобы увидеть список детей.</p>
              )}
            </div>

            <div className="add-child-form mt-5">
              <h3>Добавить ребенка</h3>
              <div className="form-group">
                <label htmlFor="firstname">Имя:</label>
                <input
                  type="text"
                  id="firstname"
                  name="firstname"
                  className="form-control"
                  value={newChild.firstname}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group mt-3">
                <label htmlFor="lastname">Фамилия:</label>
                <input
                  type="text"
                  id="lastname"
                  name="lastname"
                  className="form-control"
                  value={newChild.lastname}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group mt-3">
                <label htmlFor="kindergartenId">Садик:</label>
                <select
                  id="kindergartenId"
                  name="kindergartenId"
                  className="form-control"
                  value={newChild.kindergartenId}
                  onChange={handleInputChange}
                >
                  <option value="">-- Выберите садик --</option>
                  {kindergartens.map((kg) => (
                    <option key={kg.id} value={kg.id}>
                      {kg.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group mt-3">
                <label htmlFor="groupId">Группа:</label>
                <select
                  id="groupId"
                  name="groupId"
                  className="form-control"
                  value={newChild.groupId}
                  onChange={handleInputChange}
                  disabled={!newChild.kindergartenId}
                >
                  <option value="">-- Выберите группу --</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>
              <button className="btn btn-primary mt-3" onClick={handleAddChild}>
                Добавить ребенка
              </button>
            </div>
          </div>
        );
      case 'Отчеты по группам':
        return <p>Отчеты по группам.</p>;
      case 'Выставление счетов':
        return <p>Выставление счетов.</p>;
      default:
        return null;
    }
  };

  return (
    <div className="admin-dashboard-wrapper d-flex flex-column w-100 vh-100">
      <h1>Панель администратора</h1>
      <div className="tabs d-flex">
        {['Посещение', 'Списки групп', 'Отчеты по группам', 'Выставление счетов'].map((tab) => (
          <div
            key={tab}
            className={`tab ${selectedTab === tab ? 'active' : ''}`}
            onClick={() => setSelectedTab(tab)}
          >
            {tab}
          </div>
        ))}
      </div>
      <div className="tab-content flex-grow-1">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
