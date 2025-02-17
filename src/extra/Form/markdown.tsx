import { Tab, Tabs } from 'grommet';
import * as React from 'react';
import { Link, Textarea, Theme } from '../../';
import { Markdown } from '../Markdown';

type FormWidgetProps = any;

export class MarkdownWidget extends React.Component<FormWidgetProps, {}> {
	public handleChange = ({
		target: { value },
	}: React.ChangeEvent<HTMLTextAreaElement>) => {
		return this.props.onChange(
			value === '' ? this.props.options.emptyValue : value,
		);
	};

	public handleBlur = (event: React.FocusEvent<HTMLTextAreaElement>) => {
		if (this.props.onBlur) {
			this.props.onBlur(this.props.id, event.target.value);
		}
	};

	public handleFocus = (event: React.FocusEvent<HTMLTextAreaElement>) => {
		if (this.props.onFocus) {
			this.props.onFocus(this.props.id, event.target.value);
		}
	};

	public render() {
		// Note: since React 15.2.0 we can't forward unknown element attributes, so we
		// exclude the "options" and "schema" ones here.
		const {
			value,
			readonly,
			disabled,
			autofocus,
			onBlur,
			onFocus,
			options,
			schema,
			formContext,
			...inputProps
		} = this.props;

		return (
			<React.Fragment>
				<Tabs justify="start">
					<Tab title="Write">
						<Textarea
							placeholder="This text supports markdown"
							readOnly={readonly}
							disabled={disabled}
							autoFocus={autofocus}
							value={value || ''}
							{...inputProps}
							onChange={this.handleChange}
							onBlur={this.handleBlur}
							onFocus={this.handleFocus}
							rows={5}
						/>
					</Tab>

					<Tab title="Preview">
						<Markdown
							p={3}
							style={{
								borderRadius: Theme.radius,
								width: '100%',
								minHeight: 180,
							}}
						>
							{value}
						</Markdown>
					</Tab>
				</Tabs>

				<Link
					fontSize={0}
					href={'https://guides.github.com/features/mastering-markdown/'}
					blank
				>
					About markdown
				</Link>
			</React.Fragment>
		);
	}
}
