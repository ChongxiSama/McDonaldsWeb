import { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  as?: "input";
};

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  as: "textarea";
};

type TxtFldProps = InputProps | TextareaProps;

export default function TxtFld(props: TxtFldProps) {
  if (props.as === "textarea") {
    const { className = "", ...rest } = props;
    return <textarea className={`mai-input ${className}`.trim()} {...rest} />;
  }

  const { className = "", ...rest } = props;
  return <input className={`mai-input ${className}`.trim()} {...rest} />;
}
