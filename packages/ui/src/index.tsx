import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

export function Button(props: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  const { children, style, ...rest } = props;

  return (
    <button
      {...rest}
      style={{
        padding: "10px 16px",
        borderRadius: "8px",
        border: "1px solid #0f172a",
        background: "#0f172a",
        color: "#fff",
        fontWeight: 600,
        cursor: "pointer",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
