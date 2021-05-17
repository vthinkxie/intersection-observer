import {
  ComponentType,
  FC,
  forwardRef,
  ForwardRefExoticComponent,
  HTMLAttributes,
  ReactHTML,
  ReactNode,
} from "react";
import ReactIntersectionObserver from "./intersection-observer";

export type InputComponentType =
  | ComponentType<any>
  | ForwardRefExoticComponent<any>
  | FC<any>
  | keyof ReactHTML;

export interface ItemProps extends HTMLAttributes<any> {
  children?: ReactNode;
  root?: Element | null;
  order: number;
  onIntersection?: (value: IntersectionObserverEntry) => void;
  component?: InputComponentType;
}

const Item = forwardRef((props: ItemProps, ref) => {
  const {
    children,
    root,
    order,
    onIntersection,
    component: Component = "div",
  } = props;
  const itemNode = (
    <Component ref={ref} style={{ order, flex: "0 0 40px" }}>
      {children}
    </Component>
  );
  return (
    <ReactIntersectionObserver root={root} onIntersection={onIntersection}>
      {itemNode}
    </ReactIntersectionObserver>
  );
});

export default Item;
