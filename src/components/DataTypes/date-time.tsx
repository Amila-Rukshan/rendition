import { JSONSchema6 } from 'json-schema';
import assign from 'lodash/assign';
import * as React from 'react';
import * as utils from '../../utils';
import { DataTypeEditProps } from '../Filters';
import Input, { InputProps } from '../Input';
import { getDefaultDate, normalizeDateTime } from './date-time-helpers';

export const operators = {
	is: {
		getLabel: (_s: JSONSchema6) => 'is',
	},
	is_before: {
		getLabel: (_s: JSONSchema6) => 'is before',
	},
	is_after: {
		getLabel: (_s: JSONSchema6) => 'is after',
	},
};

type OperatorSlug = keyof typeof operators;

interface DateTimeFilter extends JSONSchema6 {
	title: OperatorSlug;
	properties?: {
		[k: string]: {
			type: 'string';
			format: 'date-time';
			const: string;
			formatMaximum?: string;
			formatMinimum?: string;
		};
	};
}

export const decodeFilter = (
	filter: DateTimeFilter,
): {
	field: string;
	operator: OperatorSlug;
	value: string;
} | null => {
	if (!filter.properties) {
		return null;
	}

	const keys = Object.keys(filter.properties);
	if (!keys.length) {
		return null;
	}

	const field = keys[0];
	const operator = filter.title;
	let value: string;

	if (operator === 'is') {
		value = filter.properties[field].const!;
	} else if (operator === 'is_before') {
		value = filter.properties[field].formatMaximum!;
	} else if (operator === 'is_after') {
		value = filter.properties[field].formatMinimum!;
	} else {
		return null;
	}

	return {
		field,
		operator,
		value,
	};
};

export const createFilter = (
	field: string,
	operator: OperatorSlug,
	value: any,
	schema: JSONSchema6,
): DateTimeFilter => {
	const { title } = schema;
	const base: DateTimeFilter = {
		$id: utils.randomString(),
		title: operator,
		description: `${title || field} ${operators[operator].getLabel(
			schema,
		)} ${value}`,
		type: 'object',
	};

	const normalizedValue = normalizeDateTime(value);

	if (operator === 'is') {
		return assign(base, {
			properties: {
				[field]: {
					type: 'string',
					format: 'date-time',
					const: normalizedValue,
				},
			},
			required: [field],
		});
	}

	if (operator === 'is_before') {
		return assign(base, {
			properties: {
				[field]: {
					type: 'string',
					format: 'date-time',
					formatMaximum: normalizedValue,
				},
			},
			required: [field],
		});
	}

	if (operator === 'is_after') {
		return assign(base, {
			properties: {
				[field]: {
					type: 'string',
					format: 'date-time',
					formatMinimum: normalizedValue,
				},
			},
			required: [field],
		});
	}

	return base;
};

export const Edit = ({
	value,
	onUpdate,
	...props
}: DataTypeEditProps & InputProps & { slim?: boolean }) => {
	// If a value isn't provided here, set the value to today's date
	if (!value) {
		onUpdate(getDefaultDate());
	}
	return (
		<Input
			{...props}
			type="datetime-local"
			value={value}
			onChange={(e: React.FormEvent<HTMLInputElement>) =>
				onUpdate(e.currentTarget.value)
			}
		/>
	);
};
