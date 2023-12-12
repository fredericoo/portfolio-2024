import clsx from 'clsx';
import { AnimatePresence, LayoutGroup, motion, type Variants } from 'framer-motion';
import React, { useEffect, useId, useMemo, useState, type ComponentProps } from 'react';
import { formatAmount, getKey, getSpecialCharacters, useDebouncedValue, usePreviousValue } from './MonetaryInput.utils';

const CURRENCY_WIDTH = '1.25ch';

const variants = {
	hidden: { y: '1.2em' },
	shown: { y: 0 },
	exitNumber: { y: '1.2em' },
	exitZero: { y: '-1.2em' },
} satisfies Variants;

type MonetaryInputInternalProps = {
	/**
	 * Locale according to the Javascript Intl Api
	 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat
	 */
	locale?: string;
	currencySymbol?: string;
} & Omit<ComponentProps<'input'>, 'children'>;

/**
 * A localisable currency amount input with sleek animations.
 */
export const MonetaryInput: React.FC<MonetaryInputInternalProps> = ({
	locale = 'en-US',
	value: controlledValue,
	onChange,
	defaultValue = '0',
	currencySymbol = '$',
	className,
	name,
	...props
}) => {
	const [internalValue, setInternalValue] = useState(formatAmount(locale, { value: controlledValue || defaultValue }));
	const specialCharacters = useMemo(() => getSpecialCharacters(locale), [locale]);
	const previousLocale = usePreviousValue(locale);
	const displayValue = useDebouncedValue(internalValue, 50);
	const layoutId = useId();

	// whenever controlledValue or locale changes, update internalValue
	useEffect(() => {
		const hasLocaleChanged = previousLocale !== locale;
		const hasControlledValueChanged = internalValue.asNumber !== controlledValue;

		if (controlledValue !== undefined && (hasLocaleChanged || hasControlledValueChanged)) {
			// if there is a controlled value and needs update, re-set it
			const newValue = formatAmount(locale, { value: controlledValue?.toString() });
			setInternalValue(newValue);
		} else {
			// if uncontrolled, just refresh the display value
			setInternalValue(internalValue => formatAmount(locale, { value: internalValue.asString }));
		}
	}, [controlledValue, internalValue.asNumber, locale, previousLocale]);

	const onType = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = formatAmount(locale, e.target);

		e.target.value = newValue.asNumber.toString();
		setInternalValue(newValue);
		onChange?.(e);
	};

	return (
		<div className={clsx('flex relative w-full', className)}>
			<input type="hidden" value={internalValue.asNumber} name={name} />

			<span className="inline-block text-neutral-lightest" style={{ width: CURRENCY_WIDTH }}>
				{currencySymbol}
			</span>
			<LayoutGroup id={layoutId}>
				<AnimatedCurrency value={displayValue.asString} specialCharacters={specialCharacters} />
			</LayoutGroup>
			<input
				className="bg-transparent selection:bg-accent-base selection:text-transparent absolute z-0 inset-0 border-b border-neutral-light [font-kerning:none] p-0 transition-all duration-500 ease-expo-out text-transparent caret-neutral-base focus:border-b-accent-base focus:outline-none focus:shadow-[0_8px_6px_-6px_#e54d2e20]"
				style={{ paddingInlineStart: CURRENCY_WIDTH }}
				type="text"
				inputMode="decimal"
				pattern="[0-9,.]*"
				autoComplete="off"
				autoCorrect="off"
				value={internalValue.asString}
				onChange={onType}
				{...props}
			/>
		</div>
	);
};

type AnimatedCurrencyProps = {
	value: string | number | readonly string[];
	specialCharacters: string[] | readonly string[];
};

export const AnimatedCurrency: React.FC<AnimatedCurrencyProps> = ({ value, specialCharacters }) => {
	return (
		<div className="relative overflow-hidden flex-grow z-10 select-none pointer-events-none">
			<AnimatePresence initial={false} mode="popLayout">
				{value
					.toString()
					.split('')
					.map((char, i) => (
						<motion.span
							className="h-full inline-block overflow-hidden -mb-[0.2em]"
							key={`${char}-${getKey({ formattedIndex: i, formatted: value, specialCharacters })}`}
							layout
						>
							<motion.span
								className={clsx('text-neutral-dark block select-none pointer-events-none', {
									'opacity-25': value === '0',
								})}
								variants={variants}
								initial={'hidden'}
								animate={'shown'}
								exit={i === 0 ? 'exitZero' : 'exitNumber'}
								transition={{ duration: 0.15 }}
							>
								{char}
							</motion.span>
						</motion.span>
					))}
			</AnimatePresence>
		</div>
	);
};

export type AmountInputProps = Parameters<typeof MonetaryInput>[0];
