import {
  Children,
  cloneElement,
  ComponentElement,
  FC,
  FunctionComponentElement,
  isValidElement,
  ReactNode,
  Ref,
  RefCallback,
  RefObject,
  useEffect,
  useRef,
} from "react";
import { isMemo } from "react-is";

export interface IntersectionObserverProps {
  children: ReactNode;
  root?: Element | null;
  rootMargin?: string;
  threshold?: number;
  disabled?: boolean;
  onIntersection?: (value: IntersectionObserverEntry) => void;
}

function supportRef<T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nodeOrComponent: any
): nodeOrComponent is
  | FunctionComponentElement<{ ref: Ref<T> }>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | ComponentElement<any, any> {
  const type = isMemo(nodeOrComponent)
    ? nodeOrComponent.type.type
    : nodeOrComponent.type;

  // Function component node
  if (typeof type === "function" && !type.prototype?.render) {
    return false;
  }

  // Class component
  return !(
    typeof nodeOrComponent === "function" && !nodeOrComponent.prototype?.render
  );
}

function isRefObject<T>(ref: Ref<T>): ref is RefObject<T> {
  return !!(typeof ref === "object" && ref && "current" in ref);
}

function isRefCallback<T>(ref: Ref<T>): ref is RefCallback<T> {
  return typeof ref === "function";
}

function fillRef<T>(ref: Ref<T>, node: T) {
  if (isRefCallback(ref)) {
    ref(node);
  } else if (isRefObject(ref)) {
    // eslint-disable-next-line no-param-reassign,@typescript-eslint/no-explicit-any
    (ref as any).current = node;
  }
}

function composeRef<T>(...refs: Ref<T>[]): Ref<T> {
  return (node: T) => {
    refs.forEach((ref) => {
      fillRef(ref, node);
    });
  };
}

const ReactIntersectionObserver: FC<IntersectionObserverProps> = (props) => {
  const {
    root,
    rootMargin = "0px",
    threshold = 1.0,
    children,
    disabled = false,
    onIntersection,
  } = props;
  const intersectionObserver = useRef<IntersectionObserver | null>(null);
  const childNode = useRef<Element | null>(null);

  const setChildNode = (node: Element) => {
    childNode.current = node;
  };

  useEffect(() => {
    const element = childNode.current;
    if (
      !disabled &&
      !intersectionObserver.current &&
      root &&
      rootMargin &&
      threshold &&
      element &&
      onIntersection
    ) {
      intersectionObserver.current = new IntersectionObserver(
        (value) => {
          onIntersection(value[0]);
        },
        {
          root,
          rootMargin,
          threshold,
        }
      );
      intersectionObserver.current.observe(element);
    }
    return () => {
      if (intersectionObserver.current) {
        intersectionObserver.current.disconnect();
        intersectionObserver.current = null;
      }
    };
  }, [root, rootMargin, threshold, children, disabled, onIntersection]);
  const firstChild = Children.only(children) || null;

  if (firstChild && isValidElement(firstChild)) {
    if (supportRef(firstChild)) {
      const { ref } = firstChild;

      return cloneElement(firstChild, {
        ref: composeRef(ref as Ref<Element>, setChildNode),
      });
    }
    return firstChild;
  }
  return null;
};

export default ReactIntersectionObserver;
