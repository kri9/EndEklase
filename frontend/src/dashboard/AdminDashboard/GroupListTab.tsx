import React, { useState, useEffect } from "react";
import {
  getKindergartens,
  getGroupsByKindergarten,
  getChildrenByGroup,
  getRequest,
} from "src/api";
import { useSelector } from "react-redux";
import { RootState } from "src/redux/store";
import Filters from "./common/GroupFilter";
import ChildrenList from "./common/GroupChildrenList";
import AddChildForm from "./common/AddChildForm";

const GroupListTab: React.FC = () => {
  const [selectedKindergarten, setSelectedKindergarten] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [kindergartens, setKindergartens] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [children, setChildren] = useState<any[]>([]);
  const [usersInfo, setUsersInfo] = useState<
    { id: number; fullName: string }[]
  >([]);

  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    if (token) {
      getKindergartens(token).then(setKindergartens);
      getRequest<{ id: number; fullName: string }[]>("admin/user-emails").then(
        setUsersInfo,
      );
    }
  }, [token]);

  useEffect(() => {
    if (token && selectedKindergarten) {
      getGroupsByKindergarten(selectedKindergarten).then((r) => {
        setGroups(r);
        handleGroupChange(r?.[0]?.id);
      });
    } else {
      setGroups([]);
    }
  }, [token, selectedKindergarten]);

  // Bērnu ielāde grupā
  const loadChildren = async (groupId: string) => {
    if (token && groupId) {
      const fetchedChildren = await getChildrenByGroup(groupId);
      setChildren(fetchedChildren || []);
    }
  };

  const handleGroupChange = async (groupId: string) => {
    setSelectedGroup(groupId);
    await loadChildren(groupId);
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl mb-4">Grupu saraksti</h2>

      <Filters
        kindergartens={kindergartens}
        groups={groups}
        selectedKindergarten={selectedKindergarten}
        setSelectedKindergarten={setSelectedKindergarten}
        selectedGroup={selectedGroup}
        handleGroupChange={handleGroupChange}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        <ChildrenList
          editedChildren={children}
          reloadChildren={() => loadChildren(selectedGroup)}
        />

        <AddChildForm
          selectedKindergarten={selectedKindergarten}
          selectedGroup={selectedGroup}
          reloadChildren={() => loadChildren(selectedGroup)}
        />
      </div>
    </div>
  );
};

export default GroupListTab;
