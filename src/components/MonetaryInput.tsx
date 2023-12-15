import { AnimatePresence, LayoutGroup, motion, type Variants } from 'framer-motion';
import React, { useId, useMemo, useState, type ComponentPropsWithoutRef } from 'react';
import { formatAmount, getKey, getSpecialCharacters, useIsHydrated } from './MonetaryInput.utils';

const variants = {
	hidden: { y: '1.2em' },
	shown: { y: 0 },
	exitNumber: { y: '1.2em' },
	exitZero: { y: '-1.2em' },
} satisfies Variants;

type MonetaryInputInternalProps = {
	/** Make use of data attributes to style the character
	 * - data-char="number" for numbers
	 * - data-char="separator" for separators
	 * - data-zero="true" if the input’s total value is 0
	 */
	characterClassName?: string;

	/** A custom **stable** number format reference for usage with other locales, currency  */
	numberFormat?: Intl.NumberFormat;
};

/**
 * A localisable currency amount input with sleek animations.
 */
export const MonetaryInput = ({
	numberFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }),
	value: controlledValue,
	characterClassName,
	onChange,
	name,
	defaultValue = '0',
	type = 'text',
	pattern = '[0-9,.]*',
	inputMode = 'decimal',
	autoComplete = 'off',
	autoCorrect = 'off',
	...props
}: MonetaryInputInternalProps & Omit<ComponentPropsWithoutRef<'input'>, 'children'>) => {
	const specialCharacters = useMemo(() => getSpecialCharacters(numberFormat), [numberFormat]);
	const isHydrated = useIsHydrated();
	const [internalValue, setInternalValue] = useState<string>(defaultValue.toString());
	const formattedValue = formatAmount(numberFormat, controlledValue?.toString() || internalValue);

	const handleInternalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInternalValue(e.target.value);
		// we modify the value so `onChange` reflects the visual feedback.
		const newValue = formatAmount(numberFormat, e.target.value);
		e.target.value = newValue.asNumber.toString();
		onChange?.(e);
	};

	return (
		<>
			{isHydrated && (
				<>
					<AnimatedInputValue
						value={formattedValue.asString}
						className={characterClassName}
						separators={specialCharacters}
						isHydrated={isHydrated}
					/>
					<input type="hidden" value={formattedValue.asNumber} name={name} />
				</>
			)}
			<input
				name={isHydrated ? undefined : name}
				type={type}
				inputMode={inputMode}
				pattern={pattern}
				autoComplete={autoComplete}
				autoCorrect={autoCorrect}
				value={formattedValue.asString}
				onChange={handleInternalChange}
				style={isHydrated ? { color: 'transparent', position: 'absolute', zIndex: 0, inset: 0 } : { maxWidth: '100%' }}
				{...props}
			/>
		</>
	);
};

type AnimatedCurrencyProps = {
	value: string;
	separators: readonly string[];
	className?: string | undefined;
	isHydrated: boolean;
};

const transition = { duration: 0.3, ease: 'circOut' };

const AnimatedInputValue = ({ value, separators, className }: AnimatedCurrencyProps) => {
	const layoutId = useId();

	return (
		<div style={{ pointerEvents: 'none', flexGrow: '1', position: 'relative', overflow: 'hidden', userSelect: 'none' }}>
			<LayoutGroup id={layoutId}>
				<AnimatePresence initial={false} mode="popLayout">
					{value
						.toString()
						.split('')
						.map((char, i) => (
							<motion.span
								style={{ height: '100%', display: 'inline-block', overflow: 'hidden', marginBottom: '-0.2em' }}
								key={getKey({ char, formattedIndex: i, formatted: value, separators })}
								layout="position"
							>
								<motion.span
									data-char={separators.includes(char) ? 'separator' : 'number'}
									data-zero={value === '0' ? 'true' : undefined}
									style={{
										display: 'block',
										userSelect: 'none',
										pointerEvents: 'none',
										position: 'relative',
										zIndex: 1,
									}}
									className={className}
									variants={variants}
									initial="hidden"
									animate="shown"
									exit={i === 0 ? 'exitZero' : 'exitNumber'}
									transition={transition}
								>
									{char}
								</motion.span>
							</motion.span>
						))}
				</AnimatePresence>
			</LayoutGroup>
		</div>
	);
};
