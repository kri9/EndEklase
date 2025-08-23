import { RootFormInput, useRootObject } from "./RootObjectForm";

interface NumberInputProps extends RootFormInput {
  header: string;
  min?: number;
  max?: number;
  step?: number;
  valueMapper?: (v: number) => string;
  setterMapper?: (v: number) => number;
}

export default function NumberInput(props: NumberInputProps) {
  const [rootObjectCon, rootObjectSetterCon] = useRootObject();
  const rootObject = props.rootObject ?? rootObjectCon;
  const rootObjectSetter = props.rootObjectSetter ?? rootObjectSetterCon;
  return (
    <div id="percentage-input" className="form-group mt-3 flex flex-col items-start">
      <label htmlFor={props.field}>{props.header}:</label>
      <input
        type="number"
        min={props.min}
        max={props.max}
        id={props.field}
        step={props.step}
        name={props.field}
        className="form-control"
        value={props.valueMapper ? props.valueMapper(+rootObject[props.field]) : rootObject[props.field]}
        onChange={(e) => {
          if (props.setterMapper) {
            rootObjectSetter({ ...rootObject, [props.field]: props.setterMapper(+e.target.value) })
            return;
          }
          rootObjectSetter({ ...rootObject, [props.field]: +e.target.value })
        }}
      />
    </div>
  );
}
