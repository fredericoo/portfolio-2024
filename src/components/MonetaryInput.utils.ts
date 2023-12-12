import { useEffect, useRef, useState } from 'react';

const ONE_BILLION = 1_000_000_000;

const getDecimalSeparator = (locale: string) => {
	const numberWithDecimalSeparator = 1.1;
	return (
		Intl.NumberFormat(locale)
			.formatToParts(numberWithDecimalSeparator)
			.find(part => part.type === 'decimal')?.value || '.'
	);
};

const getThousandsSeparator = (locale: string) => {
	const numberWithThousandsSeparator = 1000;
	return (
		Intl.NumberFormat(locale)
			.formatToParts(numberWithThousandsSeparator)
			.find(part => part.type === 'group')?.value || ','
	);
};

export const getSpecialCharacters = (locale: string) =>
	[getDecimalSeparator(locale), getThousandsSeparator(locale)] as const;

/**
 * Gets key for animating between numbers.
 * @param specialCharacters - These characters will animate separately.
 * @param formattedIndex - The index of the character in the formatted string.
 * @param formatted - The formatted string.
 */
export const getKey = ({
	specialCharacters,
	formattedIndex,
	formatted,
}: {
	specialCharacters: string[] | readonly string[];
	formattedIndex: number;
	formatted: string | number | readonly string[];
}) => {
	const char = formatted.toString()[formattedIndex];
	if (!char) throw new Error('Invalid index');
	if (specialCharacters.includes(char)) {
		const specialCharIndex = formatted
			.toString()
			.slice(0, formattedIndex)
			.split('')
			.filter(c => c === char).length;
		return `${formattedIndex}-${specialCharIndex}`;
	}

	const nonSpecialCharactersBeforeIndex = formatted
		.toString()
		.slice(0, formattedIndex)
		.split('')
		.filter(c => !specialCharacters.includes(c)).length;

	return nonSpecialCharactersBeforeIndex;
};

export const formatAmount = (
	locale: string,
	inputRef: {
		// Value with **non-localised** value, e.g.: 1000.00
		value: string | number | readonly string[];
	},
) => {
	const formatter = Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format;
	const [decimalSeparator, getThousandsSeparator] = getSpecialCharacters(locale);

	// normalize the input that may come localised
	const localisedValue = inputRef.value.toString().replace('.', decimalSeparator);

	// remove everything that is not in a decimal separator or a number
	inputRef.value = localisedValue.replace(new RegExp(`[^0-9${decimalSeparator}]`, 'g'), '');

	// if there are multiple decimal separators, remove all but the last one
	const decimalSeparatorCount = inputRef.value.split(decimalSeparator).length - 1;
	if (decimalSeparatorCount > 1) {
		inputRef.value = inputRef.value.split(decimalSeparator).slice(0, decimalSeparatorCount).join(decimalSeparator);
	}

	// erase any digits over 2 decimal places
	const decimalSeparatorPlace = inputRef.value.indexOf(decimalSeparator);
	if (decimalSeparatorPlace !== -1 && inputRef.value.length > decimalSeparatorPlace + 2) {
		inputRef.value = inputRef.value.slice(0, decimalSeparatorPlace + 3);
	}

	const asNumber = Math.min(ONE_BILLION, Number(inputRef.value.replace(decimalSeparator, '.')));

	// catch invalid values and set to zero
	let asString = isNaN(asNumber) ? '0' : formatter(asNumber);

	// readd the decimal separator if it was removed
	const lastChar = inputRef.value[inputRef.value.length - 1];
	if (
		lastChar &&
		inputRef.value[inputRef.value.length - 1] &&
		[decimalSeparator, getThousandsSeparator].includes(lastChar)
	) {
		asString += lastChar;
	}

	// if last character was a zero and it was after a decimal separator, add it back
	if (lastChar === '0' && decimalSeparatorPlace !== -1 && decimalSeparatorPlace === inputRef.value.length - 3) {
		asString += lastChar;
	}
	return { asNumber, asString };
};

export const usePreviousValue = <T>(value: T) => {
	const previousValueRef = useRef<T>();

	useEffect(() => {
		previousValueRef.current = value;
	}, [value]);

	return previousValueRef.current;
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
