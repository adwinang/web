import { useEffect, useRef } from "react";
import { InputWithLabelProps } from "./type";
import styles from "./App.module.css";

const InputWithLabel = ({
  id,
  value,
  type = "text",
  onInputChange,
  isFocused,
  children,
}: InputWithLabelProps) => {
  // Imperative Programming
  // A mutable variable that is not affected by react lifecycles
  const inputRef = useRef<HTMLInputElement>(null!);
  useEffect(() => {
    if (isFocused && inputRef.current) {
      // Because we have access to the input DOM element through the ref attribute
      // We can invoke the focus function on the input element
      inputRef.current.focus();
    }
  }, [isFocused]);
  return (
    <>
      <label htmlFor={id} className={styles.label}>
        {children}
      </label>
      &nbsp;
      <input
        // Imperative Programming
        // Allows us to access the input DOM element through the ref attribute
        // The DOM element is placed under the default current property that comes with useRef
        // useRef can only ref to html elements
        ref={inputRef}
        // Declarative Programming
        // autofocus={isFocused}
        id={id}
        type={type}
        value={value}
        onChange={onInputChange}
        className={styles.input}
      />
    </>
  );
};

export { InputWithLabel };
