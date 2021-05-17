import { ReactElement, useRef, useState } from "react";
import "./App.css";
import Item from "./Item";

function App(): ReactElement {
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const list = new Array(100).fill(0).map((item, index) => index);
  const [order, setOrder] = useState<number>(list.length);
  const [realOrder, setRealOrder] = useState<number>();
  const leftOrder = useRef<number>(0);
  const rightOrder = useRef<number>(list.length);
  const reset = () => {
    leftOrder.current = 0;
    rightOrder.current = list.length;
    setRealOrder(undefined);
  };
  const onIntersection = ({ isIntersecting }: IntersectionObserverEntry) => {
    if (rightOrder.current - leftOrder.current > 1) {
      if (isIntersecting) {
        setOrder(order + 1);
        leftOrder.current = order;
      } else {
        setOrder(order - 1);
        rightOrder.current = order;
      }
    } else {
      setRealOrder(leftOrder.current);
    }
  };
  return (
    <>
      <button onClick={reset} type="button">
        reset
      </button>
      <div
        ref={(node) => {
          setRoot(node);
        }}
        style={{
          display: "flex",
          height: "18px",
          flexWrap: "wrap",
          width: "220px",
          resize: "both",
          overflow: "hidden",
        }}
      >
        {list.map((item) => (
          <Item order={item} key={item}>
            {item}
          </Item>
        ))}
        <Item
          order={realOrder || order}
          onIntersection={onIntersection}
          root={root}
        >
          ...
        </Item>
      </div>
    </>
  );
}

export default App;
