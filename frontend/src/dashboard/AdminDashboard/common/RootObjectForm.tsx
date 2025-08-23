import { createContext, useContext } from 'react';

const RootObjectContext = createContext<[any, any]>([null, null]);
export const useRootObject = () => useContext(RootObjectContext);

export interface RootFormInput {
  rootObjectSetter?: any;
  rootObject?: any;
  field: string;
}


export default function RootObjectForm(props: { rootObject: any, rootObjectSetter: any, children: any }) {
  return (
    <RootObjectContext.Provider value={[props.rootObject, props.rootObjectSetter]}>
      {props.children}
    </RootObjectContext.Provider>
  );
}
