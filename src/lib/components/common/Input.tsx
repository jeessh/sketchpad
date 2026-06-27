import type { CSSProperties, InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	label?: ReactNode;
}

const Input = ({ label, style, ...inputProps }: InputProps) => {
	const labelWidth =
		typeof label === 'string' || typeof label === 'number'
			? ({ width: `${label.toString().length}ch` } satisfies CSSProperties)
			: undefined;

	return (
		<div className="input-group" style={style}>
			{label ? (
				<label htmlFor={inputProps.id} style={labelWidth}>
					{label}
				</label>
			) : null}
			<input {...inputProps} />
		</div>
	);
};

export default Input;
