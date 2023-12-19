import { useEffect, useLayoutEffect, useState } from 'react';

const NUMBER_WITH_DECIMAL = 1.1;
const NUMBER_WITH_THOUSANDS = 1000;
const NORMAL_DECIMAL_SEP = '.';

const getDecimalSeparator = (numberFormat: Intl.NumberFormat) => {
	return numberFormat.formatToParts(NUMBER_WITH_DECIMAL).find(part => part.type === 'decimal')?.value || '';
};

const getThousandsSeparator = (numberFormat: Intl.NumberFormat) => {
	return numberFormat.formatToParts(NUMBER_WITH_THOUSANDS).find(part => part.type === 'group')?.value || '';
};

export const getSpecialCharacters = (numberFormat: Intl.NumberFormat) =>
	[getDecimalSeparator(numberFormat), getThousandsSeparator(numberFormat)] as const;

export const getCurrencySymbol = (numberFormat: Intl.NumberFormat) => {
	return numberFormat.formatToParts(0).find(part => part.type === 'currency')?.value;
};

/**
 * Gets key for animating between numbers.
 * @param char - The character to get the key for.
 * @param separators - These characters will animate separately.
 * @param formattedIndex - The index of the character in the formatted string.
 * @param formatted - The formatted string.
 */
export const getKey = ({
	char,
	separators,
	formattedIndex,
	formatted,
}: {
	char: string;
	separators: readonly string[];
	formattedIndex: number;
	formatted: string;
}) => {
	const prevInstancesOfChar = formatted
		.toString()
		.slice(0, formattedIndex)
		.split('')
		.filter(c => c === char).length;

	if (separators.includes(char)) {
		return [formattedIndex, prevInstancesOfChar, char].join('-');
	}

	return [char, prevInstancesOfChar].join('-');
};

/** Erases from the string all but the first occurrence of a character */
const eraseExtraCharacters = (value: string, character: string) => {
	const parts = value.split(character);
	return [parts[0], parts.slice(1).join('')].filter(Boolean).join(character);
};

const trimToLength = (value: string, intLength: number, decimalLength: number) => {
	const [integer, decimal] = value.split('.');
	const trimmedInt = integer?.slice(0, intLength);
	const trimmedDec = decimal?.slice(0, decimalLength);
	return [trimmedInt, trimmedDec].filter(Boolean).join('.');
};

export const formatAmount = (numberFormat: Intl.NumberFormat, typedValue: string) => {
	const formatterOptions = numberFormat.resolvedOptions();
	const decimalSep = getDecimalSeparator(numberFormat);
	const formatter = new Intl.NumberFormat(formatterOptions.locale, {
		...formatterOptions,
		minimumFractionDigits: 0,
	});

	let value = typedValue
		// remove everything that is not in a decimal separator or a number
		.replace(new RegExp(`[^0-9${decimalSep}]`, 'g'), '')
		// normalise all decimal separators to a dot
		.replace(new RegExp(`[${decimalSep}]`, 'g'), NORMAL_DECIMAL_SEP);

	value = eraseExtraCharacters(value, NORMAL_DECIMAL_SEP);
	value = trimToLength(value, 10, formatterOptions.maximumFractionDigits || 2);

	const asNumber = isNaN(Number(value)) ? 0 : Number(value);
	const parts = formatter.formatToParts(asNumber);
	let asString = parts
		.filter(part => ['fraction', 'group', 'decimal', 'integer'].includes(part.type))
		.map(part => part.value)
		.join('');
	// get rid of ending zeros and decimal separator
	asString = asString.replace(new RegExp(`\\${decimalSep}0*$`), '');

	// readd the decimal separator to the end of the formatted string if it was there
	if (!asString.includes(decimalSep)) {
		const charsToReadd = typedValue.match(
			new RegExp(`(\\${decimalSep}0{0,${formatterOptions.maximumFractionDigits}})0*$`),
		)?.[1];

		if (charsToReadd) {
			asString += charsToReadd;
		}
	}

	return { asNumber, asString };
};

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;
export const useIsHydrated = () => {
	const [isHydrated, setIsHydrated] = useState(false);
	useIsomorphicLayoutEffect(() => {
		setIsHydrated(true);
	}, []);

	return isHydrated;
};

export const useDebouncedValue = <T>(value: T, delay?: number): T => {
	const [debouncedValue, setDebouncedValue] = useState<T>(value);

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedValue(value), delay || 500);

		return () => {
			clearTimeout(timer);
		};
	}, [value, delay]);

	return debouncedValue;
};
