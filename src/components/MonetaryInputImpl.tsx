import { MonetaryInput } from './MonetaryInput';

const numberFormat = new Intl.NumberFormat('en-gb', { style: 'currency', currency: 'GBP' });

export const MonetaryInputImpl = () => (
	<MonetaryInput.Root
		className="relative text-4xl w-full flex gap-2 border-b border-neutral-light transition-all duration-500 ease-expo-out focus-within:border-b-accent-base focus-within:shadow-[0_8px_6px_-6px_#e54d2e20]"
		numberFormat={numberFormat}
	>
		<MonetaryInput.Currency className="text-base" />
		<MonetaryInput.Amount
			className={{
				wrapper: 'relative flex-1 min-w-0',
				input:
					'bg-transparent rounded-none selection:bg-neutral-lighter selection:text-transparent p-0 caret-neutral-base focus:outline-none',
				character: 'data-[char=zero]:text-neutral-base text-neutral-dark',
			}}
		/>
	</MonetaryInput.Root>
);
