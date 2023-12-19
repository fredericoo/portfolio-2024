import { AnimatePresence, LayoutGroup, motion, type Variants } from 'framer-motion';
import React, {
	useId,
	useMemo,
	useState,
	useContext,
	type ComponentPropsWithoutRef,
	forwardRef,
	type ComponentProps,
} from 'react';
import {
	formatAmount,
	getCurrencySymbol,
	getKey,
	getSpecialCharacters,
	useDebouncedValue,
	useIsHydrated,
} from './MonetaryInput.utils';

const ONE_FRAME = 1000 / 60;

const transition = { duration: 0.3, ease: 'circOut' };
const variants = {
	hiddenZero: { y: '-1.2em' },
	hiddenNumber: { y: '1.2em' },
	shown: { y: 0 },
	exitNumber: { y: '1.2em' },
	exitZero: { y: '-1.2em' },
} satisfies Variants;

const FormatContext = React.createContext<Intl.NumberFormat>(
	new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }),
);

export interface MonetaryInputRootProps extends ComponentProps<'div'> {
	/** A **stable** number format reference for usage with other locales, currencies, decimals…  */
	numberFormat?: Intl.NumberFormat;
}
const Root = forwardRef<HTMLDivElement, MonetaryInputRootProps>(
	({ numberFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }), ...props }, ref) => {
		return (
			<FormatContext.Provider value={numberFormat}>
				<div ref={ref} {...props} />
			</FormatContext.Provider>
		);
	},
);

export interface MonetaryInputAmountProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'className'> {
	className?: {
		/** Applies to the wrapper <div> around the amount selector.
		 *  This is there to allow for the animated characters to be positioned absolutely.
		 */
		wrapper?: string;
		/** Applies to the actual <input> DOM element inside there. */
		input?: string;
		/** Make use of data attributes to style the character
		 * - data-char="separator" for separators
		 * - data-char="zero" if the input’s total value is 0
		 */
		character?: string;
	};
	name?: string;
	defaultValue?: string;
	value?: string;
}
/**
 * A localisable currency amount input with sleek animations.
 */
export const Amount = forwardRef<HTMLInputElement, MonetaryInputAmountProps>(
	({ value: controlledValue, className, onChange, name, defaultValue = '', ...props }, ref) => {
		const format = useContext(FormatContext);
		const specialCharacters = useMemo(() => getSpecialCharacters(format), [format]);
		const isHydrated = useIsHydrated();
		const [internalValue, setInternalValue] = useState<string>();
		const formattedValue = formatAmount(
			format,
			controlledValue?.toString() || internalValue || defaultValue.toString(),
		);

		const handleInternalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			setInternalValue(e.target.value);
			// we modify the value so `onChange` reflects the visual feedback.
			const newValue = formatAmount(format, e.target.value);
			e.target.value = newValue.asNumber.toString();
			onChange?.(e);
		};

		const inputClassName = isHydrated
			? className?.input
			: [className?.input, className?.character].filter(Boolean).join(' ');

		return (
			<div className={className?.wrapper} {...props}>
				{isHydrated && (
					<>
						<AnimatedInputValue
							value={formattedValue.asString}
							className={className?.character}
							separators={specialCharacters}
							isHydrated={isHydrated}
						/>
						<input type="hidden" value={formattedValue.asNumber} name={name} />
					</>
				)}
				<input
					ref={ref}
					name={isHydrated ? undefined : name}
					type="text"
					inputMode="decimal"
					pattern="[0-9,.]*"
					autoComplete="off"
					autoCorrect="off"
					placeholder={isHydrated ? undefined : formattedValue.asString}
					value={isHydrated ? formattedValue.asString : defaultValue.toString()}
					onChange={handleInternalChange}
					style={
						isHydrated
							? { color: 'transparent', zIndex: 0, width: 'inherit', fontKerning: 'none' }
							: { maxWidth: '100%' }
					}
					className={inputClassName}
				/>
			</div>
		);
	},
);

type AnimatedCurrencyProps = {
	value: string;
	separators: readonly string[];
	className?: string | undefined;
	isHydrated: boolean;
};

const AnimatedInputValue = ({ value, separators, className }: AnimatedCurrencyProps) => {
	const layoutId = useId();
	// This prevents clumping of numbers, which would cause the animation to be janky.
	const displayValue = useDebouncedValue(value, ONE_FRAME);
	const isZero = displayValue === '0';
	return (
		<div
			style={{
				pointerEvents: 'none',
				position: 'absolute',
				inset: 0,
				overflow: 'hidden',
				userSelect: 'none',
			}}
		>
			<LayoutGroup id={layoutId}>
				<AnimatePresence initial={false} mode="popLayout">
					{displayValue
						.toString()
						.split('')
						.map((char, i) => (
							<motion.span
								style={{ height: '100%', display: 'inline-block', overflow: 'hidden', marginBottom: '-0.2em' }}
								key={isZero ? 'zero' : getKey({ char, formattedIndex: i, formatted: displayValue, separators })}
								layout="position"
							>
								<motion.span
									data-char={separators.includes(char) ? 'separator' : isZero ? 'zero' : 'number'}
									style={{
										display: 'block',
										userSelect: 'none',
										pointerEvents: 'none',
										position: 'relative',
										zIndex: 1,
									}}
									className={className}
									variants={variants}
									initial={isZero ? 'hiddenZero' : 'hiddenNumber'}
									animate="shown"
									exit={isZero ? 'exitZero' : 'exitNumber'}
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

export interface MonetaryInputCurrencyProps extends Omit<ComponentProps<'div'>, 'children'> {}
const Currency = forwardRef<HTMLDivElement, MonetaryInputCurrencyProps>((props, ref) => {
	const format = useContext(FormatContext);
	const currencySymbol = useMemo(() => getCurrencySymbol(format), [format]);
	return (
		<div ref={ref} {...props}>
			{currencySymbol}
		</div>
	);
});

export const MonetaryInput = { Root, Currency, Amount };
