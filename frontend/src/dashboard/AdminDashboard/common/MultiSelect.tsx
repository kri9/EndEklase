import { IdSupplier } from "src/common/interfaces";
import { RootFormInput, useRootObject } from "./RootObjectForm";
import hash from "object-hash";
import { useState } from "react";
import { StringMap } from "src/common/types";
import { get } from "lodash";

export interface MultiSelectOption extends IdSupplier {
  name: string;
}

export interface MultiSelectProps<T extends MultiSelectOption>
  extends RootFormInput {
  options: T[];
  columns: string[];
  columnMap: StringMap;
}

export default function MultiSelect<T extends MultiSelectOption>(
  props: MultiSelectProps<T>,
) {
  const [rootObjectCon, rootObjectSetterCon] = useRootObject();
  const rootObject = props.rootObject ?? rootObjectCon;
  const rootObjectSetter = props.rootObjectSetter ?? rootObjectSetterCon;
  const [selectedOption, setSelectedOption] = useState<T>(props.options[0]);
  let arrField: any[] = rootObject[props.field];

  return (
    <>
      <select
        className="form-control mt-4"
        onChange={(s) => {
          setSelectedOption(
            props.options.filter((i) => i.id == s.target.value)[0]!,
          );
        }}
      >
        {props.options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
      <button
        className="btn btn-secondary mt-2"
        onClick={() => {
          if (!selectedOption) return;
          arrField.push(selectedOption);
          rootObjectSetter({ ...rootObject, [props.field]: arrField });
        }}
      >
        + Pievienot
      </button>
      <table className="table-bordered mt-3 w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-center text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            {Object.values(props.columnMap).map((c, i) => (
              <th key={i}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody className="text-center">
          {arrField &&
            arrField.length != 0 &&
            arrField.map((i: any) => (
              <tr key={hash(i)}>
                {Object.keys(props.columnMap).map((v) => (
                  <td key={hash(i) + "." + v}>{get(i, v)}</td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </>
  );
}
