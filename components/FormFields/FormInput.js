import React, { useRef } from 'react';

import styles from "./FormInput.module.css";
import FormGroup from "./FormGroup.js";

import { useFormContext } from 'react-hook-form';

export default function FormInput({ label, type: enumType, ...rest }) {
  const { register } = useFormContext();
  let inputRef = React.createRef();

  const { name } = rest;
  const type = enumType.toLowerCase();

  return (
    <FormGroup label={label} name={name}>
      <input className={styles.input} ref={ref => {
        ref = inputRef;
        register({ required: rest.required });
      }} id={name} type={type} {...rest} />
    </FormGroup>
  );
}
