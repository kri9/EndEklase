import { RootFormInput, useRootObject } from "./RootObjectForm";

export default function TextInput(props: { header: string } & RootFormInput) {
  const [rootObjectCon, rootObjectSetterCon] = useRootObject();
  const rootObject = props.rootObject ?? rootObjectCon;
  const rootObjectSetter = props.rootObjectSetter ?? rootObjectSetterCon;

  return (
    <div className="form-group mt-3 flex flex-col items-start">
      <label className="inline " htmlFor={props.field}>{props.header}:</label>
      <input
        type="text"
        id={props.field}
        name={props.field}
        className="form-control"
        value={rootObject[props.field]}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          rootObjectSetter({ ...rootObject, [props.field]: event.target.value })
        }}
      />
    </div>
  );
}
