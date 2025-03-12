import React from "react";

interface FiltersProps {
  kindergartens: any[];
  groups: any[];
  selectedKindergarten: string;
  setSelectedKindergarten: (id: string) => void;
  selectedGroup: string;
  handleGroupChange: (groupId: string) => void;
}

const Filters: React.FC<FiltersProps> = ({
  kindergartens,
  groups,
  selectedKindergarten,
  setSelectedKindergarten,
  selectedGroup,
  handleGroupChange,
}) => {
  return (
    <div className="mb-4 flex flex-col md:flex-row gap-4">
      <div className="form-group">
        <label>Выберите садик:</label>
        <select className="form-control" value={selectedKindergarten} onChange={(e) => setSelectedKindergarten(e.target.value)}>
          <option value="">-- Выберите садик --</option>
          {kindergartens.map((kg) => (
            <option key={kg.id} value={kg.id}>
              {kg.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Выберите группу:</label>
        <select className="form-control" value={selectedGroup} onChange={(e) => handleGroupChange(e.target.value)} disabled={!selectedKindergarten}>
          <option value="">-- Выберите группу --</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Filters;
