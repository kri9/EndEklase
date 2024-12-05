import { useEffect, useState } from "react";
import { DeleteIcon, EditIcon } from "src/assets/Icons";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface CrudTableProps<T extends object> {
  items: T[];
  columns?: string[];
  onDelete: (item: T) => void;
}

function ActionButton(props: any) {
  return (
    <button onClick={props.onClick} className="bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-2.5 py-2.5 text-center inline-flex items-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
      {props.children}
    </button>
  );
}

export default function CrudTable<T extends object>(props: CrudTableProps<T>) {
  const [items, setItems] = useState(props.items);
  useEffect(() => setItems(props.items), [props.items])
  const columns = props.columns || (items.length ? Object.keys(items[0]) : []);

  if (!columns.length) {
    return (<>
      <div className="flex align-center justify-center mt-5 text-3xl">Empty table</div>
    </>);
  }
  return (<>
    <table className="table-bordered mt-5 w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
      <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
        <tr>
          {columns.map((c, index) => <th key={index} scope="col" className="px-6 py-3">{c}</th>)}
          <th scope="col" className="px-6 py-3">Actions</th>
        </tr>
      </thead>
      <tbody>
        {items.map((it, index) =>
          <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
            {Object.values(it).map((v: any, index) => {
              return <th key={index} className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{v}</th>;
            })}
            <th>
              <div className="flex align-center justify-center">
                <ActionButton>
                  <EditIcon />
                </ActionButton>
                <ActionButton onClick={() => {
                  props.onDelete(it);
                  setItems(items.filter(i => i != it))
                }}>
                  <DeleteIcon />
                </ActionButton>
              </div>
            </th>
          </tr>)}
      </tbody>
    </table>
  </>);
}
