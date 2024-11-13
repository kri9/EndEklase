import { RootFormInput, useRootObject } from "./RootObjectForm";

export default function BooleanInput(props: { displayText: string } & RootFormInput) {
  const [rootObjectCon, rootObjectSetterCon] = useRootObject();
  const rootObject = props.rootObject ?? rootObjectCon;
  const rootObjectSetter = props.rootObjectSetter ?? rootObjectSetterCon;

  return (
    <div className="mt-3 block flex">
      <input
        className="form-check-input"
        checked={rootObject[props.field]}
        type="checkbox"
        id={props.field}
        onChange={(e) => {
          rootObjectSetter({ ...rootObject, [props.field]: e.target.checked })
        }}
      />
      <label className="form-check-label ml-2" htmlFor="flexCheckDefault">
        {props.displayText}
      </label>
    </div>
  );
}
