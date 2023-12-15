import { MonetaryInput } from './MonetaryInput';

const numberFormat = new Intl.NumberFormat('en-gb', { style: 'currency', currency: 'GBP' });

export const MonetaryInputImpl = () => (
	<div className="flex relative w-full text-4xl">
		<MonetaryInput
			numberFormat={numberFormat}
			className="bg-transparent rounded-none selection:bg-neutral-lighter selection:text-transparent border-b border-neutral-light [font-kerning:none] p-0 transition-all duration-500 ease-expo-out caret-neutral-base focus:border-b-accent-base focus:outline-none focus:shadow-[0_8px_6px_-6px_#e54d2e20]"
			characterClassName="data-[zero]:text-neutral-base text-neutral-dark"
		/>
	</div>
);
